import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductionOrderEntity } from '../entity/production-order.entity';
import { BomProcessItemEntity } from '../../bom/entity/bom-process-item.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { ItemImageEntity } from '../../item/entity/item-image.entity';
import { GeneralUtilities } from '../../package/utilities/general.utilities';
import { AttachmentMasterService } from '../../attachment-master/service/attachment-master.service';
import { AttachmentModule } from '../../attachment-master/enums/attachment-module.enum';
import { BomCostUtility, ItemPriceLookup } from '../../bom/utility/bom-cost.utility';
import { BomItemCategorizerUtility } from '../../bom/utility/bom-item-categorizer.utility';
import { AppRequest } from '../../package/types/app-request.type';
import {
  ProductionOrderDetailsDto,
  ProductionOrderListDto,
} from '../dto/production-order.dto';

@Injectable()
export class ProductionOrderListService {
  constructor(
    @InjectRepository(ProductionOrderEntity)
    private readonly poRepo: Repository<ProductionOrderEntity>,
    @InjectRepository(BomProcessItemEntity)
    private readonly bomProcessItemRepo: Repository<BomProcessItemEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
    @InjectRepository(ItemImageEntity)
    private readonly itemImageRepo: Repository<ItemImageEntity>,
    private readonly general: GeneralUtilities,
    private readonly attachmentMasterService: AttachmentMasterService,
  ) { }

  private async finishSuccess(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success || 1,
        message: params?.message || 'Success',
        data: params?.data !== undefined ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  private async finishFailure(params: any, incomingData?: any) {
    const output: any = {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data !== undefined ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async startProductionOrderList(req: AppRequest, params: ProductionOrderListDto) {
    const response = await this.getProductionOrderList(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getProductionOrderList(req: AppRequest, params: ProductionOrderListDto) {
    let return_data: any = {};
    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const qb = this.poRepo.createQueryBuilder('po');
      qb.select([
        'po.id AS id',
        'po.productionOrderCode AS productionOrderCode',
        'po.companyId AS companyId',
        'po.bomId AS bomId',
        'po.itemId AS itemId',
        'po.productionQuantity AS productionQuantity',
        'po.pendingQuantity AS pendingQuantity',
        'po.referenceNumber AS referenceNumber',
        'po.productionDate AS productionDate',
        'po.remark AS remark',
        'po.plantId AS plantId',
        'po.customerId AS customerId',
        'po.status AS status',
        'po.addedDate AS addedDate',
        'po.updatedDate AS updatedDate',
        'po.addedBy AS addedBy',
        'po.updatedBy AS updatedBy',
      ]);

      qb.addSelect('company.companyName', 'companyName');
      qb.leftJoin('company', 'company', 'company.id = po.companyId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.itemCode', 'itemCode');
      qb.addSelect('item.primitiveQuantity', 'primitiveQuantity');
      qb.addSelect('item.isDecimalAllowed', 'isDecimalAllowed');
      qb.leftJoin('item_master', 'item', 'item.id = po.itemId');

      qb.addSelect('itemUom.uomName', 'itemUomName');
      qb.leftJoin('item_uom_master', 'itemUom', 'itemUom.id = item.itemUomId');

      qb.addSelect('packageUom.packageName', 'packageUomName');
      qb.leftJoin('package_master', 'packageUom', 'packageUom.id = item.packageUomId');

      qb.addSelect('bom.bomName', 'bomName');
      qb.addSelect('bom.bomCode', 'bomCode');
      qb.addSelect('bom.productionMethod', 'productionMethod');
      qb.leftJoin('bom_master', 'bom', 'bom.id = po.bomId');

      qb.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      qb.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');
      qb.leftJoin('users', 'addedByUser', 'addedByUser.id = po.addedBy');
      qb.leftJoin('users', 'updatedByUser', 'updatedByUser.id = po.updatedBy');

      qb.addSelect('currency.currencySymbol', 'currencySymbol');
      qb.leftJoin('company_currency_mapping', 'cc', 'cc.companyId = po.companyId');
      qb.leftJoin(
        'currency_master',
        'currency',
        "currency.currencyCode = cc.currencyCode AND currency.status = 'Active' AND currency.sysRecDeleted = 0",
      );

      qb.where('po.sysRecDeleted = 0');

      if (!this.general.isSuperAdmin(req)) {
        qb.andWhere('po.companyId = :companyId', { companyId: req.user?.companyId });
      } else if (params.companyId) {
        qb.andWhere('po.companyId = :companyId', { companyId: params.companyId });
      }

      if (params.itemId) {
        qb.andWhere('po.itemId = :itemId', { itemId: params.itemId });
      }

      if (params.bomId) {
        qb.andWhere('po.bomId = :bomId', { bomId: params.bomId });
      }

      if (params.status) {
        qb.andWhere('po.status = :status', { status: params.status });
      }

      if (params.search && params.search.trim() !== '') {
        const searchVal = `%${params.search.trim()}%`;
        qb.andWhere(
          '(po.productionOrderCode LIKE :search OR item.itemName LIKE :search OR item.itemCode LIKE :search OR bom.bomName LIKE :search OR bom.bomCode LIKE :search OR CONCAT(addedByUser.firstName, " ", addedByUser.lastName) LIKE :search OR po.referenceNumber LIKE :search)',
          { search: searchVal },
        );
      }

      const columnMap: Record<string, string> = {
        id: 'po.id',
        productionOrderCode: 'po.productionOrderCode',
        itemName: 'item.itemName',
        itemCode: 'item.itemCode',
        bomCode: 'bom.bomCode',
        bomName: 'bom.bomName',
        productionQuantityDisplay: 'po.productionQuantity',
        productionQuantity: 'po.productionQuantity',
        packageQuantityDisplay: 'po.productionQuantity',
        packageQuantity: 'po.productionQuantity',
        productionDateFormatted: 'po.productionDate',
        productionDate: 'po.productionDate',
        addedByName: "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        addedBy: 'po.addedBy',
        status: 'po.status',
        addedDate: 'po.addedDate',
      };

      if (params.filters && params.filters.length > 0) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          columnMap,
          params.logicalOperator,
        );
        if (whereString) {
          qb.andWhere(`(${whereString})`);
        }
      }

      const sortColumn = params.sortField && columnMap[params.sortField] ? columnMap[params.sortField] : 'po.id';
      const sortOrder = params.sortOrder && ['ASC', 'DESC'].includes(params.sortOrder.toUpperCase()) ? (params.sortOrder.toUpperCase() as 'ASC' | 'DESC') : 'DESC';
      qb.orderBy(sortColumn, sortOrder);

      qb.offset(skip).limit(limit);

      const [rawList, totalCount] = await Promise.all([qb.getRawMany(), qb.getCount()]);

      const formattedList = await Promise.all(
        rawList.map(async (row) => {
          const numProdQty = parseFloat(String(row.productionQuantity || 0));
          const numPendingQty = parseFloat(String(row.pendingQuantity || 0));
          const numPrimitiveQty = parseFloat(String(row.primitiveQuantity || 1)) || 1;

          const numPackageQty = parseFloat((numProdQty / numPrimitiveQty).toFixed(4));
          const numPendingPackageQty = parseFloat((numPendingQty / numPrimitiveQty).toFixed(4));

          const uomSuffix = row.itemUomName ? ` ${row.itemUomName}` : '';
          const pkgSuffix = row.packageUomName ? ` ${row.packageUomName}` : ' Unit(s)';

          return {
            ...row,
            productionQuantity: numProdQty,
            pendingQuantity: numPendingQty,
            primitiveQuantity: numPrimitiveQty,
            packageQuantity: numPackageQty,
            pendingPackageQuantity: numPendingPackageQty,
            productionQuantityDisplay: `${numProdQty.toFixed(2)}${uomSuffix}`,
            pendingQuantityDisplay: `${numPendingQty.toFixed(2)}${uomSuffix}`,
            packageQuantityDisplay: `${numPackageQty.toFixed(2)}${pkgSuffix}`,
            currencySymbol: row.currencySymbol || '',
            addedDateFormatted: row.addedDate ? await this.general.dateFormat(row.addedDate) : null,
            updatedDateFormatted: row.updatedDate ? await this.general.dateFormat(row.updatedDate) : null,
            productionDateFormatted: row.productionDate ? await this.general.dateFormat(row.productionDate) : null,
          };
        }),
      );

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: {
          list: formattedList,
          pagination: this.general.buildPaginationResponse(totalCount, page, limit, skip),
        },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startProductionOrderDetails(req: AppRequest, query: ProductionOrderDetailsDto) {
    const response = await this.getProductionOrderDetails(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getProductionOrderDetails(req: AppRequest, query: ProductionOrderDetailsDto) {
    let return_data: any = {};
    try {
      if (!query.id) throw new Error('Production Order ID is required');

      const qb = this.poRepo.createQueryBuilder('po');
      qb.select([
        'po.id AS id',
        'po.productionOrderCode AS productionOrderCode',
        'po.companyId AS companyId',
        'po.bomId AS bomId',
        'po.itemId AS itemId',
        'po.productionQuantity AS productionQuantity',
        'po.pendingQuantity AS pendingQuantity',
        'po.referenceNumber AS referenceNumber',
        'po.productionDate AS productionDate',
        'po.remark AS remark',
        'po.plantId AS plantId',
        'po.customerId AS customerId',
        'po.status AS status',
        'po.addedDate AS addedDate',
        'po.updatedDate AS updatedDate',
        'po.addedBy AS addedBy',
        'po.updatedBy AS updatedBy',
      ]);

      qb.addSelect('company.companyName', 'companyName');
      qb.leftJoin('company', 'company', 'company.id = po.companyId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.itemCode', 'itemCode');
      qb.addSelect('item.primitiveQuantity', 'primitiveQuantity');
      qb.addSelect('item.isDecimalAllowed', 'isDecimalAllowed');
      qb.leftJoin('item_master', 'item', 'item.id = po.itemId');

      qb.addSelect('itemUom.uomName', 'itemUomName');
      qb.leftJoin('item_uom_master', 'itemUom', 'itemUom.id = item.itemUomId');

      qb.addSelect('packageUom.packageName', 'packageUomName');
      qb.leftJoin('package_master', 'packageUom', 'packageUom.id = item.packageUomId');

      qb.addSelect('bom.bomName', 'bomName');
      qb.addSelect('bom.bomCode', 'bomCode');
      qb.addSelect('bom.productionMethod', 'productionMethod');
      qb.leftJoin('bom_master', 'bom', 'bom.id = po.bomId');

      qb.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      qb.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');
      qb.leftJoin('users', 'addedByUser', 'addedByUser.id = po.addedBy');
      qb.leftJoin('users', 'updatedByUser', 'updatedByUser.id = po.updatedBy');

      qb.addSelect('currency.currencySymbol', 'currencySymbol');
      qb.addSelect('currency.currencyCode', 'currencyCode');
      qb.leftJoin('company_currency_mapping', 'cc', 'cc.companyId = po.companyId');
      qb.leftJoin(
        'currency_master',
        'currency',
        "currency.currencyCode = cc.currencyCode AND currency.status = 'Active' AND currency.sysRecDeleted = 0",
      );

      qb.where('po.id = :id', { id: query.id });
      qb.andWhere('po.sysRecDeleted = 0');

      const poDetails = await qb.getRawOne();
      if (!poDetails) throw new Error('Production Order not found');

      this.general.assertCompanyAccess(req, poDetails.companyId, 'view', 'Production Order');

      const numProdQty = parseFloat(String(poDetails.productionQuantity || 0));
      const numPendingQty = parseFloat(String(poDetails.pendingQuantity || 0));
      const numPrimitiveQty = parseFloat(String(poDetails.primitiveQuantity || 1)) || 1;

      const numPackageQty = parseFloat((numProdQty / numPrimitiveQty).toFixed(4));
      const numPendingPackageQty = parseFloat((numPendingQty / numPrimitiveQty).toFixed(4));

      const uomSuffix = poDetails.itemUomName ? ` ${poDetails.itemUomName}` : '';
      const pkgSuffix = poDetails.packageUomName ? ` ${poDetails.packageUomName}` : ' Unit(s)';
      const currencySymbol = poDetails.currencySymbol || '';
      const symbolPrefix = currencySymbol ? `${currencySymbol} ` : '';

      poDetails.productionQuantity = numProdQty;
      poDetails.pendingQuantity = numPendingQty;
      poDetails.primitiveQuantity = numPrimitiveQty;
      poDetails.packageQuantity = numPackageQty;
      poDetails.pendingPackageQuantity = numPendingPackageQty;

      poDetails.productionQuantityDisplay = `${numProdQty.toFixed(2)}${uomSuffix}`;
      poDetails.pendingQuantityDisplay = `${numPendingQty.toFixed(2)}${uomSuffix}`;
      poDetails.packageQuantityDisplay = `${numPackageQty.toFixed(2)}${pkgSuffix}`;

      poDetails.addedDateFormatted = poDetails.addedDate ? await this.general.dateFormat(poDetails.addedDate) : null;
      poDetails.updatedDateFormatted = poDetails.updatedDate ? await this.general.dateFormat(poDetails.updatedDate) : null;
      poDetails.productionDateFormatted = poDetails.productionDate ? await this.general.dateFormat(poDetails.productionDate) : null;

      // Fetch component items for the referenced BOM to calculate cost and categorize material tabs
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
        'itemUom.uomName AS itemUomName',
      ]);
      itemQb.leftJoin('process_template_mapping', 'ptm', 'ptm.id = bpi.processTemplateMappingId');
      itemQb.leftJoin('process_master', 'pm', 'pm.id = ptm.processId');
      itemQb.leftJoin('item_master', 'im', 'im.id = bpi.itemId');
      itemQb.leftJoin('item_uom_master', 'itemUom', 'itemUom.id = im.itemUomId');
      itemQb.where('bpi.bomId = :bomId', { bomId: poDetails.bomId });
      itemQb.orderBy('ptm.sequenceNo', 'ASC');

      const rawItems = await itemQb.getRawMany();

      // Collect all component item IDs to build price and image lookup maps
      const itemIds = Array.from(new Set(rawItems.map((r) => Number(r.itemId))));
      const allItemIds = Array.from(new Set([Number(poDetails.itemId), ...itemIds].filter(Boolean)));

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
          }),
        );
      }

      poDetails.itemImageUrl = itemImageMap.get(Number(poDetails.itemId)) || null;

      // Build entry/exit item ID sets for cost calculation (row-level, no dedup needed)
      const exitItemIds = new Set(
        rawItems.filter((r) => r.materialType === 'Exit').map((r) => Number(r.itemId)),
      );
      const entryItemIds = new Set(
        rawItems.filter((r) => r.materialType === 'Entry').map((r) => Number(r.itemId)),
      );

      // For BomCostUtility: keep all rows, mark Entry isInternalTransfer correctly
      // (Exit rows are skipped by BomCostUtility automatically)
      const itemsForCostCalc = rawItems.map((r) => ({
        itemId: Number(r.itemId),
        materialType: r.materialType,
        quantity: Number(r.quantity),
        isInternalTransfer: r.materialType === 'Entry' && exitItemIds.has(Number(r.itemId)),
      }));

      // Calculate Live Cost Per Unit via BomCostUtility
      const costResult = BomCostUtility.calculateLiveCost(itemsForCostCalc, itemPriceMap);

      poDetails.itemCostPerUnit = costResult.totalUnitCost;
      poDetails.itemCostPerUnitFormatted = symbolPrefix ? `${symbolPrefix}${costResult.totalUnitCost.toFixed(2)}` : costResult.totalUnitCost.toFixed(2);

      const estimatedTotalCost = parseFloat((costResult.totalUnitCost * numPackageQty).toFixed(4));
      poDetails.estimatedTotalCost = estimatedTotalCost;
      poDetails.estimatedTotalCostFormatted = symbolPrefix ? `${symbolPrefix}${estimatedTotalCost.toFixed(2)}` : estimatedTotalCost.toFixed(2);

      // --- Deduplication-first categorisation ---
      // Build a deduplicated map: one representative row per unique itemId
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

      const mainItemId = Number(poDetails.itemId);
      const rawMaterials: any[] = [];
      const semiFinished: any[] = [];
      const finishedProducts: any[] = [];

      for (const [itemId, row] of uniqueItemMap) {
        const inEntry = entryItemIds.has(itemId);
        const inExit = exitItemIds.has(itemId);

        if (itemId === mainItemId) {
          // Main manufactured product always goes to Finished Products
          finishedProducts.unshift({ ...row, isInternalTransfer: false });
        } else if (inEntry && inExit) {
          // Appears in both — intermediate semi-finished product
          semiFinished.push({ ...row, isInternalTransfer: true });
        } else if (inEntry && !inExit) {
          // Entry-only — raw material from inventory
          rawMaterials.push({ ...row, isInternalTransfer: false });
        } else if (!inEntry && inExit) {
          // Exit-only and not main product — byproduct, goes to Finished Products
          finishedProducts.push({ ...row, isInternalTransfer: false });
        }
      }

      // If main product has no BOM row, construct it from poDetails directly
      if (!uniqueItemMap.has(mainItemId)) {
        const mainPrice = itemPriceMap.get(mainItemId);
        finishedProducts.unshift({
          id: null,
          itemId: mainItemId,
          itemName: poDetails.itemName,
          itemCode: poDetails.itemCode,
          materialType: 'Exit',
          quantity: 1,
          isInternalTransfer: false,
          itemImageUrl: itemImageMap.get(mainItemId) || null,
          costPrice: mainPrice?.costPrice ?? null,
          purchasePrice: mainPrice?.purchasePrice ?? null,
          itemUomName: poDetails.itemUomName || null,
        });
      }

      // Pass pre-categorised unique items through BomItemCategorizerUtility for formatting
      poDetails.materialDetails = BomItemCategorizerUtility.categorizeItems(
        [
          ...rawMaterials,
          ...semiFinished,
          ...finishedProducts,
        ],
        numPackageQty,
        currencySymbol,
      );

      // Fetch attachments
      poDetails.attachments = await this.attachmentMasterService.getAttachmentsByEntity(
        poDetails.companyId,
        AttachmentModule.PRODUCTION_ORDER,
        poDetails.id,
      );

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: poDetails,
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }
}
