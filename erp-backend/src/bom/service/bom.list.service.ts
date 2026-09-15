import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { BomEntity } from '../entity/bom.entity';
import { BomProcessItemEntity } from '../entity/bom-process-item.entity';
import { ProcessTemplateMappingEntity } from '../../process-template/entity/process.template.mapping.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { ItemImageEntity } from '../../item/entity/item-image.entity';
import { BomDetailsDto, BomListDto } from '../dto/bom.dto';
import { BomCostUtility, ItemPriceLookup } from '../utility/bom-cost.utility';
import { BomItemCategorizerUtility } from '../utility/bom-item-categorizer.utility';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';

@Injectable()
export class BomListService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly attachmentMasterService: AttachmentMasterService,
  ) {}

  @InjectRepository(BomEntity)
  private readonly bomRepo: Repository<BomEntity>;

  @InjectRepository(BomProcessItemEntity)
  private readonly bomProcessItemRepo: Repository<BomProcessItemEntity>;

  @InjectRepository(ItemEntity)
  private readonly itemRepo: Repository<ItemEntity>;

  @InjectRepository(ItemImageEntity)
  private readonly itemImageRepo: Repository<ItemImageEntity>;

  @InjectRepository(ProcessTemplateMappingEntity)
  private readonly processTemplateMappingRepo: Repository<ProcessTemplateMappingEntity>;

  async startBomList(req: IAppRequest, params: BomListDto) {
    const response = await this.getBomList(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getBomList(req: IAppRequest, params: BomListDto) {
    let return_data: any = {};
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user?.companyId;
      }


      const { page, limit, skip } = this.general.parsePagination(params);

      const qb = this.bomRepo.createQueryBuilder('bom');

      qb.select([
        'bom.id AS id',
        'bom.bomName AS bomName',
        'bom.bomCode AS bomCode',
        'bom.productionMethod AS productionMethod',
        'bom.itemId AS itemId',
        'bom.processTemplateId AS processTemplateId',
        'bom.customerId AS customerId',
        'bom.referenceNumber AS referenceNumber',
        'bom.remarks AS remarks',
        'bom.status AS status',
        'bom.companyId AS companyId',
        'bom.addedDate AS addedDate',
        'bom.updatedDate AS updatedDate',
        'bom.addedBy AS addedBy',
        'bom.updatedBy AS updatedBy',
      ]);

      qb.addSelect('company.companyName', 'companyName');
      qb.leftJoin('company', 'company', 'company.id = bom.companyId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.itemCode', 'itemCode');
      qb.addSelect('item.barcode', 'itemBarcode');
      qb.leftJoin('item_master', 'item', 'item.id = bom.itemId');

      qb.addSelect('template.templateName', 'processTemplateName');
      qb.addSelect('template.templateCode', 'processTemplateCode');
      qb.leftJoin('process_template', 'template', 'template.id = bom.processTemplateId');

      qb.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      qb.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');
      qb.leftJoin('users', 'addedByUser', 'addedByUser.id = bom.addedBy');
      qb.leftJoin('users', 'updatedByUser', 'updatedByUser.id = bom.updatedBy');

      qb.addSelect('currency.currencySymbol', 'currencySymbol');
      qb.leftJoin('company_currency_mapping', 'cc', 'cc.companyId = bom.companyId');
      qb.leftJoin(
        'currency_master',
        'currency',
        "currency.currencyCode = cc.currencyCode AND currency.status = 'Active' AND currency.sysRecDeleted = 0",
      );

      qb.addSelect(
        '(SELECT COUNT(1) FROM bom_process_items bpi WHERE bpi.bomId = bom.id AND bpi.materialType = \'Entry\')',
        'totalMaterial',
      );

      qb.where('bom.sysRecDeleted = 0');

      this.general.applyCompanyScope(qb, req, 'bom');

      if (params.itemId) {
        qb.andWhere('bom.itemId = :itemId', { itemId: params.itemId });
      }

      if (params.processTemplateId) {
        qb.andWhere('bom.processTemplateId = :processTemplateId', { processTemplateId: params.processTemplateId });
      }

      if (params.status) {
        qb.andWhere('bom.status = :status', { status: params.status });
      }

      await this.general.applyListQuery(qb, params, 'bom.id');

      const totalCount = await qb.getCount();
      qb.offset(skip).limit(limit);

      const rawResults = await qb.getRawMany();

      await this.general.formatDate(rawResults);

      if (rawResults.length > 0) {
        const itemIds = Array.from(new Set(rawResults.map((r) => Number(r.itemId)).filter(Boolean)));
        const itemImageMap = new Map<number, string>();
        if (itemIds.length > 0) {
          const itemImages = await this.itemImageRepo.find({
            where: { itemId: In(itemIds), sysRecDeleted: false },
            order: { isPrimary: 'DESC', id: 'ASC' },
          });
          await Promise.all(
            itemImages.map(async (img) => {
              if (!itemImageMap.has(Number(img.itemId))) {
                const url = await this.general.generateUrl('item', `${img.itemId}`, img.fileName);
                itemImageMap.set(Number(img.itemId), url);
              }
            }),
          );
        }

        const bomIds = rawResults.map((r) => Number(r.id));
        const allProcessItems = await this.bomProcessItemRepo.find({
          where: { bomId: In(bomIds) },
        });

        const componentItemIds = Array.from(new Set(allProcessItems.map((p) => Number(p.itemId)).filter(Boolean)));
        const itemPriceMap = new Map<number, ItemPriceLookup>();
        if (componentItemIds.length > 0) {
          const componentItems = await this.itemRepo.find({
            where: { id: In(componentItemIds), sysRecDeleted: false },
            select: { id: true, costPrice: true, purchasePrice: true, itemName: true, itemCode: true },
          });
          componentItems.forEach((c) => {
            itemPriceMap.set(Number(c.id), {
              id: Number(c.id),
              costPrice: c.costPrice,
              purchasePrice: c.purchasePrice,
              itemName: c.itemName,
              itemCode: c.itemCode,
            });
          });
        }

        rawResults.forEach((bomRow) => {
          const bId = Number(bomRow.id);
          const bomItems = allProcessItems.filter((p) => Number(p.bomId) === bId);
          const exitItemIds = new Set(
            bomItems.filter((p) => p.materialType === 'Exit').map((p) => Number(p.itemId)),
          );

          const costResult = BomCostUtility.calculateLiveCost(
            bomItems.map((p) => ({
              itemId: Number(p.itemId),
              materialType: p.materialType,
              quantity: p.quantity,
              isInternalTransfer: p.materialType === 'Entry' && exitItemIds.has(Number(p.itemId)),
            })),
            itemPriceMap,
          );

          bomRow.itemImageUrl = itemImageMap.get(Number(bomRow.itemId)) || null;
          bomRow.liveCalculatedCostPerUnit = costResult.totalUnitCost;
          bomRow.totalMaterial = Number(bomRow.totalMaterial || 0);

          const currencySym = bomRow.currencySymbol || '₦';
          const liveCostFormatted = Number(costResult.totalUnitCost || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          bomRow.costPerUnit = costResult.totalUnitCost;
          bomRow.costPerUnitFormatted = `${currencySym} ${liveCostFormatted}`;
        });
      }

      const pagination = this.general.buildPaginationResponse(totalCount, page, limit, skip);

      return_data = {
        success: 1,
        message: 'BOM List retrieved successfully.',
        data: {
          list: rawResults,
          pagination,
        },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = {
        success: 0,
        message: err.message,
      };
    }
    return return_data;
  }

  async startBomDetails(req: IAppRequest, params: BomDetailsDto) {
    const response = await this.getBomDetails(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }


  async getBomDetails(req: IAppRequest, params: BomDetailsDto) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('BOM ID is required');
      }

      const qb = this.bomRepo.createQueryBuilder('bom');
      qb.select([
        'bom.id AS id',
        'bom.bomName AS bomName',
        'bom.bomCode AS bomCode',
        'bom.productionMethod AS productionMethod',
        'bom.itemId AS itemId',
        'bom.processTemplateId AS processTemplateId',
        'bom.customerId AS customerId',
        'bom.referenceNumber AS referenceNumber',
        'bom.remarks AS remarks',
        'bom.status AS status',
        'bom.companyId AS companyId',
        'bom.addedDate AS addedDate',
        'bom.updatedDate AS updatedDate',
        'bom.addedBy AS addedBy',
        'bom.updatedBy AS updatedBy',
      ]);

      qb.addSelect('company.companyName', 'companyName');
      qb.leftJoin('company', 'company', 'company.id = bom.companyId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.itemCode', 'itemCode');
      qb.addSelect('item.primitiveQuantity', 'primitiveQuantity');
      qb.addSelect('item.itemUomId', 'itemUomId');
      qb.addSelect('uom.uomName', 'uomName');
      qb.addSelect('uom.itemUomCode', 'itemUomCode');
      qb.addSelect('item.packageUomId', 'packageUomId');
      qb.addSelect('p_uom.packageName', 'packageUomName');

      qb.leftJoin('item_master', 'item', 'item.id = bom.itemId');
      qb.leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId');
      qb.leftJoin('package_master', 'p_uom', 'p_uom.id = item.packageUomId');


      qb.addSelect('template.templateName', 'processTemplateName');
      qb.addSelect('template.templateCode', 'processTemplateCode');
      qb.leftJoin('process_template', 'template', 'template.id = bom.processTemplateId');

      qb.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      qb.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');
      qb.leftJoin('users', 'addedByUser', 'addedByUser.id = bom.addedBy');
      qb.leftJoin('users', 'updatedByUser', 'updatedByUser.id = bom.updatedBy');

      qb.addSelect('currency.currencySymbol', 'currencySymbol');
      qb.addSelect('currency.currencyCode', 'currencyCode');
      qb.leftJoin('company_currency_mapping', 'cc', 'cc.companyId = bom.companyId');
      qb.leftJoin(
        'currency_master',
        'currency',
        "currency.currencyCode = cc.currencyCode AND currency.status = 'Active' AND currency.sysRecDeleted = 0",
      );

      qb.where('bom.id = :id', { id: params.id });
      qb.andWhere('bom.sysRecDeleted = 0');

      console.log()
      const bomDetails = await qb.getRawOne();
      if (!bomDetails) {
        throw new Error('BOM not found');
      }

      this.general.assertCompanyAccess(req, bomDetails.companyId, 'view', 'BOM');

      bomDetails.addedDateFormatted = bomDetails.addedDate ? await this.general.dateFormat(bomDetails.addedDate) : null;
      bomDetails.updatedDateFormatted = bomDetails.updatedDate ? await this.general.dateFormat(bomDetails.updatedDate) : null;

      const itemQb = this.bomProcessItemRepo.createQueryBuilder('bpi');
      itemQb.select([
        'bpi.id AS id',
        'bpi.bomId AS bomId',
        'bpi.processTemplateMappingId AS processTemplateMappingId',
        'bpi.materialType AS materialType',
        'bpi.itemId AS itemId',
        'bpi.quantity AS quantity',
        'bpi.isPrimary AS isPrimary',
        'ptm.sequenceNo AS sequenceNo',
        'pm.id AS processId',
        'pm.processName AS processName',
        'pm.processCode AS processCode',
        'im.itemName AS itemName',
        'im.itemCode AS itemCode',
        'im.costPrice AS costPrice',
        'im.purchasePrice AS purchasePrice',
        'im.primitiveQuantity AS primitiveQuantity',
        'uom.uomName AS uomName',
      ]);
      itemQb.leftJoin('process_template_mapping', 'ptm', 'ptm.id = bpi.processTemplateMappingId');
      itemQb.leftJoin('process_master', 'pm', 'pm.id = ptm.processId');
      itemQb.leftJoin('item_master', 'im', 'im.id = bpi.itemId');
      itemQb.leftJoin('item_uom_master', 'uom', 'uom.id = im.itemUomId');
      itemQb.where('bpi.bomId = :bomId', { bomId: params.id });
      itemQb.orderBy('ptm.sequenceNo', 'ASC');

      const rawItems = await itemQb.getRawMany();

      const itemIds = Array.from(new Set(rawItems.map((r) => Number(r.itemId))));
      const allItemIds = Array.from(
        new Set([Number(bomDetails.itemId), ...itemIds].filter(Boolean))
      );

      const itemPriceMap = new Map<number, ItemPriceLookup>();
      const itemImageMap = new Map<number, string>();

      if (allItemIds.length > 0) {
        const itemEntities = await this.itemRepo.find({
          where: { id: In(allItemIds) },
          select: { id: true, itemName: true, itemCode: true, costPrice: true, purchasePrice: true },
        });
        itemEntities.forEach((it) => {
          itemPriceMap.set(it.id, {
            id: it.id,
            itemName: it.itemName,
            itemCode: it.itemCode,
            costPrice: it.costPrice,
            purchasePrice: it.purchasePrice,
          });
        });

        const images = await this.itemImageRepo.find({
          where: { itemId: In(allItemIds), sysRecDeleted: false },
          order: { isPrimary: 'DESC', id: 'ASC' },
        });

        await Promise.all(
          images.map(async (img) => {
            if (!itemImageMap.has(img.itemId)) {
              const url = await this.general.generateUrl('item', `${img.itemId}`, img.fileName);
              itemImageMap.set(img.itemId, url);
            }
          })
        );
      }

      bomDetails.itemImageUrl = itemImageMap.get(Number(bomDetails.itemId)) || null;

      const exitItemIds = new Set(
        rawItems
          .filter((r) => r.materialType === 'Exit')
          .map((r) => Number(r.itemId))
      );

      const costResult = BomCostUtility.calculateLiveCost(
        rawItems.map((r) => ({
          itemId: Number(r.itemId),
          materialType: r.materialType,
          quantity: r.quantity,
          isInternalTransfer: r.materialType === 'Entry' && exitItemIds.has(Number(r.itemId)),
        })),
        itemPriceMap,
      );

      bomDetails.liveCalculatedCostPerUnit = costResult.totalUnitCost;
      
      const currencySymbol = bomDetails.currencySymbol || '';
      const liveCostFormatted = Number(costResult.totalUnitCost || 0).toFixed(2);
      bomDetails.costPerUnit = currencySymbol ? `${currencySymbol} ${liveCostFormatted}` : liveCostFormatted;
      bomDetails.costBreakdown = costResult;

      const processStagesMap = new Map<number, any>();

      if (bomDetails.processTemplateId) {
        const templateMappings = await this.processTemplateMappingRepo
          .createQueryBuilder('ptm')
          .select([
            'ptm.id AS processTemplateMappingId',
            'ptm.sequenceNo AS sequenceNo',
            'pm.id AS processId',
            'pm.processName AS processName',
            'pm.processCode AS processCode',
          ])
          .leftJoin('process_master', 'pm', 'pm.id = ptm.processId')
          .where('ptm.templateId = :templateId', { templateId: bomDetails.processTemplateId })
          .orderBy('ptm.sequenceNo', 'ASC')
          .getRawMany();

        templateMappings.forEach((tm) => {
          const seq = Number(tm.sequenceNo);
          processStagesMap.set(seq, {
            sequenceNo: seq,
            processTemplateMappingId: Number(tm.processTemplateMappingId),
            processId: Number(tm.processId),
            processName: tm.processName,
            processCode: tm.processCode,
            entryItems: [],
            exitItems: [],
          });
        });
      }

      rawItems.forEach((r) => {
        const seq = Number(r.sequenceNo);
        if (!processStagesMap.has(seq)) {
          processStagesMap.set(seq, {
            sequenceNo: seq,
            processTemplateMappingId: Number(r.processTemplateMappingId),
            processId: Number(r.processId),
            processName: r.processName,
            processCode: r.processCode,
            entryItems: [],
            exitItems: [],
          });
        }
        const stage = processStagesMap.get(seq);
        const itemObj = {
          id: Number(r.id),
          itemId: Number(r.itemId),
          itemName: r.itemName,
          itemCode: r.itemCode,
          quantity: Number(r.quantity),
          isPrimary: r.isPrimary,
          costPrice: r.costPrice ? parseFloat(String(r.costPrice)) : 0,
          purchasePrice: r.purchasePrice ? parseFloat(String(r.purchasePrice)) : 0,
          itemImageUrl: itemImageMap.get(Number(r.itemId)) || null,
          isInternalTransfer: r.materialType === 'Entry' && exitItemIds.has(Number(r.itemId)),
          uomName: r.uomName || '',
          primitiveQuantity: r.primitiveQuantity ? parseFloat(String(r.primitiveQuantity)) : 1,
        };

        if (r.materialType === 'Entry') {
          stage.entryItems.push(itemObj);
        } else {
          stage.exitItems.push(itemObj);
        }
      });

      bomDetails.processStages = Array.from(processStagesMap.values());

      const entryItemIds = new Set(
        rawItems.filter((r) => r.materialType === 'Entry').map((r) => Number(r.itemId)),
      );

      const uniqueItemMap = new Map<number, any>();
      for (const r of rawItems) {
        const id = Number(r.itemId);
        if (!uniqueItemMap.has(id)) {
          uniqueItemMap.set(id, {
            ...r,
            quantity: Number(r.quantity),
            itemImageUrl: itemImageMap.get(id) || null,
          });
        }
      }

      const mainItemId = Number(bomDetails.itemId);
      const rawMaterials: any[] = [];
      const semiFinished: any[] = [];
      const finishedProducts: any[] = [];

      for (const [itemId, row] of uniqueItemMap) {
        const inEntry = entryItemIds.has(itemId);
        const inExit = exitItemIds.has(itemId);

        if (itemId === mainItemId) {
          finishedProducts.unshift({ ...row, isInternalTransfer: false });
        } else if (inEntry && inExit) {
          semiFinished.push({ ...row, isInternalTransfer: true });
        } else if (inEntry && !inExit) {
          rawMaterials.push({ ...row, isInternalTransfer: false });
        } else if (!inEntry && inExit) {
          finishedProducts.push({ ...row, isInternalTransfer: false });
        }
      }

      if (!uniqueItemMap.has(mainItemId)) {
        const mainPrice = itemPriceMap.get(mainItemId);
        finishedProducts.unshift({
          id: null,
          itemId: mainItemId,
          itemName: bomDetails.itemName,
          itemCode: bomDetails.itemCode,
          materialType: 'Exit',
          quantity: 1,
          isInternalTransfer: false,
          itemImageUrl: itemImageMap.get(mainItemId) || null,
          costPrice: mainPrice?.costPrice ?? null,
          purchasePrice: mainPrice?.purchasePrice ?? null,
          itemUomName: bomDetails.itemUomName || null,
        });
      }

      bomDetails.materialDetails = BomItemCategorizerUtility.categorizeItems(
        [...rawMaterials, ...semiFinished, ...finishedProducts],
        1,
        currencySymbol,
      );

      bomDetails.attachments = await this.attachmentMasterService.getAttachmentsByEntity(
        bomDetails.companyId,
        AttachmentModule.BOM,
        bomDetails.id,
      );
      
      return_data = {
        success: 1,
        message: 'BOM details retrieved successfully.',
        data: bomDetails,
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = {
        success: 0,
        message: err.message,
      };
    }
    return return_data;
  }

  async finishSuccess(params: any, incomingData?: any) {
    let output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async finishFailure(params: any, incomingData?: any) {
    let output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }
}
