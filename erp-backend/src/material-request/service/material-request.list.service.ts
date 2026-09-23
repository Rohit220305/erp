import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';
import { ItemEntity } from '../../item/entity/item.entity';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ProductionBatchItemEntity } from '../../production-batch/entity/production-batch-item.entity';
import { ProductionBatchProcessEntity } from '../../production-batch/entity/production-batch-process.entity';
import { ProductionBatchEntity } from '../../production-batch/entity/production-batch.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { MaterialRequestListDto, MaterialRequestSuggestDto } from '../dto/material-request.dto';
import { MaterialRequestItemEntity } from '../entity/material-request-item.entity';
import { MaterialRequestEntity } from '../entity/material-request.entity';
import { MaterialType } from '../../production-batch/enum/production-batch.enum';
import { ItemUomEntity } from '../../item-uom/entity/item-uom.entity';

@Injectable()
export class MaterialRequestListService {
  constructor(
    @InjectRepository(MaterialRequestEntity)
    private readonly materialRequestRepo: Repository<MaterialRequestEntity>,
    @InjectRepository(MaterialRequestItemEntity)
    private readonly materialRequestItemRepo: Repository<MaterialRequestItemEntity>,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
    @InjectRepository(ProductionBatchItemEntity)
    private readonly pbItemRepo: Repository<ProductionBatchItemEntity>,
    private readonly general: GeneralUtilities,
    private readonly attachmentMasterService: AttachmentMasterService,
  ) {}

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
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async startMaterialRequestSuggest(req: IAppRequest, query: MaterialRequestSuggestDto) {
    const response = await this.getMaterialRequestSuggest(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getMaterialRequestSuggest(req: IAppRequest, query: MaterialRequestSuggestDto) {
    let return_data: any = {};
    try {
      if (!query.productionBatchId) {
        throw new Error('Production Batch ID is required');
      }

      const isSuperAdmin = this.general.isSuperAdmin(req);
      const companyId = req.user?.companyId;

      const batch = await this.pbRepo.findOne({
        where: { id: query.productionBatchId, sysRecDeleted: false },
      });
      if (!batch) {
        throw new Error('Production Batch not found');
      }
      if (!isSuperAdmin && batch.companyId !== companyId) {
        throw new Error('Access denied to this Production Batch');
      }

      const batchData = await this.pbRepo
        .createQueryBuilder('pb')
        .select([
          'pb.id AS id',
          'pb.batchCode AS batchCode',
          'pb.batchQuantity AS batchQuantity',
          'pb.status AS status',
          'pb.materialStatus AS materialStatus',
          'pb.productionOrderId AS productionOrderId',
          'pb.bomId AS bomId',
          'pb.itemId AS itemId',
        ])
        .addSelect('po.productionOrderCode', 'productionOrderCode')
        .leftJoin('production_order', 'po', 'po.id = pb.productionOrderId')
        .addSelect('bom.bomName', 'bomName')
        .addSelect('bom.bomCode', 'bomCode')
        .addSelect('bom.processTemplateId', 'processTemplateId')
        .leftJoin('bom_master', 'bom', 'bom.id = pb.bomId')
        .addSelect('pt.templateName', 'processTemplateName')
        .leftJoin('process_template', 'pt', 'pt.id = bom.processTemplateId')
        .addSelect('item.itemName', 'itemName')
        .addSelect('item.itemCode', 'itemCode')
        .leftJoin('item_master', 'item', 'item.id = pb.itemId')
        .addSelect('uom.uomName', 'uomName')
        .leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId')
        .where('pb.id = :id', { id: query.productionBatchId })
        .getRawOne();

      const qb = this.pbItemRepo
        .createQueryBuilder('pbi')
        .innerJoin(ProductionBatchProcessEntity, 'pbp', 'pbp.id = pbi.productionBatchProcessId')
        .leftJoin(ItemEntity, 'item', 'item.id = pbi.itemId')
        .leftJoin(ItemUomEntity, 'uom', 'uom.id = item.itemUomId')
        .select([
          'pbi.itemId AS itemId',
          'pbi.materialType AS materialType',
          'item.itemName AS itemName',
          'item.itemCode AS itemCode',
          'uom.uomName AS uomName',
          'pbi.requiredQty AS requiredQty',
          'pbi.availableStock AS availableStock',
          'pbi.shortage AS shortage',
          'pbi.requestedQty AS requestedQty',
        ])
        .where('pbp.productionBatchId = :pbId', { pbId: query.productionBatchId });

      const allItems = await qb.getRawMany();

      const exitItemIds = new Set(
        allItems
          .filter((i) => i.materialType === 'Exit' || i.materialType === MaterialType.Exit)
          .map((i) => Number(i.itemId)),
      );

      const rawItems = allItems.filter((i) => {
        const isEntry = i.materialType === 'Entry' || i.materialType === MaterialType.Entry;
        return isEntry && !exitItemIds.has(Number(i.itemId));
      });

      const itemImageMap = new Map<number, string>();
      const rawItemIds = Array.from(new Set(rawItems.map((i) => Number(i.itemId)).filter(Boolean)));
      if (rawItemIds.length > 0) {
        const rawImages = await this.pbItemRepo.manager
          .createQueryBuilder()
          .select(['img.itemId AS itemId', 'img.fileName AS fileName'])
          .from('item_images', 'img')
          .where('img.itemId IN (:...rawItemIds)', { rawItemIds })
          .andWhere('img.sysRecDeleted = 0')
          .orderBy('img.isPrimary', 'DESC')
          .addOrderBy('img.id', 'ASC')
          .getRawMany();

        await Promise.all(
          rawImages.map(async (img) => {
            const id = Number(img.itemId);
            if (!itemImageMap.has(id)) {
              try {
                const url = await this.general.generateUrl('item', `${id}`, img.fileName);
                itemImageMap.set(id, url);
              } catch (e) {
                itemImageMap.set(id, '');
              }
            }
          }),
        );
      }

      const consolidatedMap = new Map<number, any>();
      for (const row of rawItems) {
        const itemId = Number(row.itemId);
        const reqQty = Number(row.requiredQty || 0);
        const availStock = Number(row.availableStock || 0);
        const existingShortage = Number(row.shortage || 0);
        const existingReqQty = Number(row.requestedQty || row.requestQty || 0);

        if (!consolidatedMap.has(itemId)) {
          consolidatedMap.set(itemId, {
            itemId,
            itemName: row.itemName,
            itemCode: row.itemCode,
            uomName: row.uomName,
            itemImageUrl: itemImageMap.get(itemId) || null,
            requiredQty: reqQty,
            availableStock: availStock,
            requestedQty: existingReqQty,
            shortage: existingShortage,
          });
        } else {
          const existing = consolidatedMap.get(itemId);
          existing.requiredQty += reqQty;
          existing.availableStock += availStock;
          existing.requestedQty += existingReqQty;
          existing.shortage += existingShortage;
        }
      }

      const suggestions = Array.from(consolidatedMap.values()).map((item) => {
        const shortage = Math.max(0, item.requiredQty - item.availableStock);
        const suggestedQty = Math.max(0, item.requiredQty - item.availableStock );
        return {
          ...item,
          shortage,
          suggestedQty,
          requiredQtyFormatted: this.general.formatQuantityWithUom(item.requiredQty, item.uomName),
          availableStockFormatted: this.general.formatQuantityWithUom(item.availableStock, item.uomName),
          shortageFormatted: this.general.formatQuantityWithUom(shortage, item.uomName),
          suggestedQtyFormatted: this.general.formatQuantityWithUom(suggestedQty, item.uomName),
        };
      });
      return_data = {
        success: 1,
        message: 'Material request suggestions fetched successfully.',
        data: {
          batchData,
          suggestions,
        },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startMaterialRequestList(req: IAppRequest, query: MaterialRequestListDto) {
    const response = await this.getMaterialRequestsList(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getMaterialRequestsList(req: IAppRequest, query: MaterialRequestListDto) {
    let return_data: any = {};
    try {
      const isSuperAdmin = this.general.isSuperAdmin(req);
      const companyId = req.user?.companyId;

      const qb = this.materialRequestRepo
        .createQueryBuilder('materialRequest')
        .leftJoin('users', 'u', 'u.id = materialRequest.requestedBy')
        .select([
          'materialRequest.id AS id',
          'materialRequest.companyId AS companyId',
          'materialRequest.productionBatchId AS productionBatchId',
          'materialRequest.code AS code',
          'materialRequest.remark AS remark',
          'materialRequest.status AS status',
          'materialRequest.requestedBy AS requestedBy',
          'materialRequest.requestedDate AS requestedDate',
          'materialRequest.deliveredDate AS deliveredDate',
          'CONCAT(u.firstName, " ", u.lastName) AS requestedByName',
        ])
        .where('materialRequest.sysRecDeleted = :sysRecDeleted', { sysRecDeleted: false });

      if (!isSuperAdmin) {
        qb.andWhere('materialRequest.companyId = :companyId', { companyId: Number(companyId) });
      }
      if (query.productionBatchId) {
        qb.andWhere('materialRequest.productionBatchId = :pbId', { pbId: Number(query.productionBatchId) });
      }
      if (query.status) {
        qb.andWhere('materialRequest.status = :status', { status: query.status });
      }
      if (query.search) {
        qb.andWhere('(materialRequest.code LIKE :search OR materialRequest.remark LIKE :search)', { search: `%${query.search}%` });
      }

      qb.orderBy('materialRequest.id', 'DESC');


      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const total = await qb.getCount();

      qb.offset((page - 1) * limit).limit(limit);
      const materialRequestList = await qb.getRawMany();

      const enrichedList = await Promise.all(
        materialRequestList.map(async (materialRequest) => {
          const materialRequestItems = await this.materialRequestItemRepo
            .createQueryBuilder('mri')
            .leftJoin(ItemEntity, 'item', 'item.id = mri.itemId')
            .select([
              'mri.id AS id',
              'mri.itemId AS itemId',
              'mri.requestedQty AS requestedQty',
              'item.itemName AS itemName',
              'item.itemCode AS itemCode',
            ])
            .where('mri.materialRequestId = :materialRequestId', { materialRequestId: materialRequest.id })
            .getRawMany();

          const attachments = await this.attachmentMasterService.getAttachmentsByEntity(
            materialRequest.companyId,
            AttachmentModule.MATERIAL_REQUEST,
            materialRequest.id,
          );

          return {
            ...materialRequest,
            requestedQtySum: materialRequestItems.reduce((acc, i) => acc + (Number(i.requestedQty) || 0), 0),
            requestedQtySumFormatted: this.general.formatNumber(materialRequestItems.reduce((acc, i) => acc + (Number(i.requestedQty) || 0), 0)),
            items: materialRequestItems.map((i) => ({
              ...i,
              requestedQty: Number(i.requestedQty) || 0,
              requestedQtyFormatted: this.general.formatNumber(i.requestedQty || 0),
            })),
            attachments,
          };
        }),
      );

      return_data = {
        success: 1,
        message: 'Material requests fetched successfully.',
        data: {
          list: enrichedList,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }
}
