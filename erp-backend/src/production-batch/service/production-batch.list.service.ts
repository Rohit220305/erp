import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionBatchEntity } from '../entity/production-batch.entity';
import { ProductionBatchProcessEntity } from '../entity/production-batch-process.entity';
import { ProductionBatchItemEntity } from '../entity/production-batch-item.entity';

import { MaterialType } from '../enum/production-batch.enum';
import { ProductionOrderEntity } from '../../production-order/entity/production-order.entity';
import { BomEntity } from '../../bom/entity/bom.entity';
import { BomProcessItemEntity } from '../../bom/entity/bom-process-item.entity';
import { ProcessTemplateMappingEntity } from '../../process-template/entity/process.template.mapping.entity';
import { ProcessTemplateEntity } from '../../process-template/entity/process.template.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { UserEntity } from '../../user/entity/user.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { ProductionBatchSuggestDto, ProductionBatchListDto, ProductionBatchDetailsDto, ProcessDetailsDto } from '../dto/production-batch.dto';
import { BatchItemCategorizerUtility } from '../utility/batch-item-categorizer.utility';

@Injectable()
export class ProductionBatchListService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly attachmentMasterService: AttachmentMasterService,
    private readonly itemCategorizer: BatchItemCategorizerUtility,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
    @InjectRepository(ProductionBatchProcessEntity)
    private readonly pbProcessRepo: Repository<ProductionBatchProcessEntity>,
    @InjectRepository(ProductionBatchItemEntity)
    private readonly pbItemRepo: Repository<ProductionBatchItemEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(ProductionOrderEntity)
    private readonly poRepo: Repository<ProductionOrderEntity>,
    @InjectRepository(BomEntity)
    private readonly bomRepo: Repository<BomEntity>,
    @InjectRepository(BomProcessItemEntity)
    private readonly bomProcessItemRepo: Repository<BomProcessItemEntity>,
    @InjectRepository(ProcessTemplateMappingEntity)
    private readonly processTemplateMappingRepo: Repository<ProcessTemplateMappingEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
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

  async startBatchSuggest(req: IAppRequest, query: ProductionBatchSuggestDto) {
    const response = await this.getBatchSuggest(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getBatchSuggest(req: IAppRequest, query: ProductionBatchSuggestDto) {
    let return_data: any = {};
    try {
      if (!query.productionOrderId) {
        throw new Error('Production Order ID is required');
      }

      const isSuperAdmin = this.general.isSuperAdmin(req);
      const companyId = req.user?.companyId;

      const poWhere: any = { id: query.productionOrderId, sysRecDeleted: false };
      if (!isSuperAdmin) poWhere.companyId = companyId;

      const qb = this.poRepo.createQueryBuilder('po');
      qb.select([
        'po.id AS id',
        'po.productionOrderCode AS productionOrderCode',
        'po.productionQuantity AS productionQuantity',
        'po.pendingQuantity AS pendingQuantity',
        'po.productionDate AS productionDate',
        'po.customerId AS customerId',
        'po.plantId AS plantId',
        'po.companyId AS companyId',
        'po.itemId AS itemId',
      ]);
      qb.addSelect('bom.bomName', 'bomName');
      qb.addSelect('bom.id', 'bomId');
      qb.addSelect('bom.processTemplateId', 'processTemplateId');
      qb.leftJoin('bom_master', 'bom', 'bom.id = po.bomId');

      qb.addSelect('template.templateName', 'processTemplateName');
      qb.leftJoin('process_template', 'template', 'template.id = bom.processTemplateId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.primitiveQuantity', 'primitiveQuantity');
      qb.leftJoin('item_master', 'item', 'item.id = po.itemId');

      qb.addSelect('uom.uomName', 'uomName');
      qb.leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId');

      qb.addSelect('customerCompany.name', 'customerName');
      qb.leftJoin('customer_company', 'customerCompany', 'customerCompany.id = po.customerId');

      qb.addSelect("CONCAT(user.firstName, ' ', user.lastName)", 'addedByName');
      qb.leftJoin('users', 'user', 'user.id = po.addedBy');

      qb.where('po.id = :id', { id: query.productionOrderId });
      qb.andWhere('po.sysRecDeleted = 0');
      if (!isSuperAdmin) {
        qb.andWhere('po.companyId = :companyId', { companyId });
      }

      const poDetails = await qb.getRawOne();
      if (!poDetails) {
        throw new Error('Production Order not found or access denied');
      }

      const primitiveQuantity = poDetails.primitiveQuantity || 1;

      const mappings = await this.processTemplateMappingRepo
        .createQueryBuilder('ptm')
        .select(['ptm.id', 'ptm.processId', 'ptm.sequenceNo'])
        .addSelect('pm.processName', 'processName')
        .leftJoin('process_master', 'pm', 'pm.id = ptm.processId')
        .where('ptm.templateId = :templateId', { templateId: poDetails.processTemplateId })
        .orderBy('ptm.sequenceNo', 'ASC')
        .getRawMany();

      if (!mappings || mappings.length === 0) {
        throw new Error('Process template has no sequence mappings');
      }

      const bomProcessItems = await this.bomProcessItemRepo
        .createQueryBuilder('bpi')
        .select([
          'bpi.processTemplateMappingId',
          'bpi.itemId',
          'bpi.materialType',
          'bpi.quantity as baseQty',
        ])
        .addSelect(['item.itemName as itemName', 'item.itemCode as itemCode'])
        .addSelect('itemUom.uomName as itemUomName')
        .leftJoin('item_master', 'item', 'item.id = bpi.itemId')
        .leftJoin('item_uom_master', 'itemUom', 'itemUom.id = item.itemUomId')
        .where('bpi.bomId = :bomId', { bomId: poDetails.bomId })
        .getRawMany();

      const processes = mappings.map((mapping) => {
        const stepItems = bomProcessItems
          .filter((i) => i.bpi_processTemplateMappingId === mapping.ptm_id)
          .map((i) => ({
            itemId: i.bpi_itemId,
            itemName: i.itemName,
            itemCode: i.itemCode,
            materialType: i.bpi_materialType,
            baseQty: parseFloat(i.baseQty || i.bpi_quantity || 0),
            itemUomName: i.itemUomName || '',
          }));

        return {
          processTemplateMappingId: mapping.ptm_id,
          processId: mapping.ptm_processId,
          processName: mapping.processName,
          sequenceNumber: mapping.ptm_sequenceNo,
          items: stepItems,
        };
      });

      const existingBatchCount = await this.pbRepo.count({
        where: {
          productionOrderId: query.productionOrderId,
          sysRecDeleted: false,
        },
      });
      const batchSeqNo = existingBatchCount + 1;
      const suggestedBatchCode = `${poDetails.productionOrderCode}/${batchSeqNo}`;

      return_data = {
        success: 1,
        message: 'BOM suggest fetched successfully.',
        data: {
          ...poDetails,
          productionQuantityDisplay: this.general.formatQuantityWithUom(poDetails.productionQuantity, poDetails.uomName),
          pendingQuantityDisplay: this.general.formatQuantityWithUom(poDetails.pendingQuantity, poDetails.uomName),
          productionDateFormatted: poDetails.productionDate ? await this.general.dateFormat(poDetails.productionDate) : null,
          primitiveQuantity: parseFloat(String(primitiveQuantity)),
          batchSeqNo,
          suggestedBatchCode,
          processes,
        },
      };
    } catch (err: any) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }
    return return_data;
  }

  async startProductionBatchList(req: IAppRequest, params: ProductionBatchListDto) {
    const response = await this.getProductionBatchList(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getProductionBatchList(req: IAppRequest, params: ProductionBatchListDto) {
    let return_data: any = {};
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user?.companyId;
      }

      const { page, limit, skip } = this.general.parsePagination(params);

      const qb = this.pbRepo.createQueryBuilder('pb');
      qb.select([
        'pb.id AS id',
        'pb.companyId AS companyId',
        'pb.productionOrderId AS productionOrderId',
        'pb.bomId AS bomId',
        'pb.batchCode AS batchCode',
        'pb.itemId AS itemId',
        'pb.batchQuantity AS batchQuantity',
        'pb.status AS status',
        'pb.materialStatus AS materialStatus',
        'pb.addedDate AS addedDate',
      ]);

      qb.addSelect('po.productionOrderCode', 'productionOrderCode');
      qb.addSelect('po.plantId', 'plantId');
      qb.leftJoin('production_order', 'po', 'po.id = pb.productionOrderId');

      qb.addSelect('plant.name', 'plantName');
      qb.addSelect('plant.code', 'plantCode');
      qb.leftJoin('plant_master', 'plant', 'plant.id = po.plantId');

      qb.addSelect('customerCompany.name', 'customerName');
      qb.leftJoin('customer_company', 'customerCompany', 'customerCompany.id = po.customerId');

      qb.addSelect('bom.bomName', 'bomName');
      qb.addSelect('bom.bomCode', 'bomCode');
      qb.leftJoin('bom_master', 'bom', 'bom.id = pb.bomId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.itemCode', 'itemCode');
      qb.leftJoin('item_master', 'item', 'item.id = pb.itemId');

      qb.addSelect('uom.uomName', 'uomName');
      qb.leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId');

      qb.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      qb.addSelect('addedByUser.id as addedBy')
      qb.leftJoin('users', 'addedByUser', 'addedByUser.id = pb.addedBy');

      qb.where('pb.sysRecDeleted = 0');

      if (params.companyId) qb.andWhere('pb.companyId = :companyId', { companyId: params.companyId });
      if (params.productionOrderId) qb.andWhere('pb.productionOrderId = :poId', { poId: params.productionOrderId });
      if (params.status) qb.andWhere('pb.status = :status', { status: params.status });

      await this.general.applyListQuery(qb, params, 'pb.id', 'DESC');

      const totalCount = await qb.getCount();
      qb.offset(skip).limit(limit);

      const rawList = await qb.getRawMany();

      const formattedList = await Promise.all(
        rawList.map(async (row) => ({
          ...row,
          batchQuantityFormatted: this.general.formatQuantityWithUom(row.batchQuantity, row.uomName),
          addedDateFormatted: row.addedDate ? await this.general.dateFormat(row.addedDate) : null,
          updatedDateFormatted: row.updatedDate ? await this.general.dateFormat(row.updatedDate) : null,
        }))
      );

      return_data = {
        success: 1,
        message: 'Data found successfully.',
        data: {
          list: formattedList,
          pagination: this.general.buildPaginationResponse(totalCount, page, limit, skip),
        },
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startProductionBatchProcessDetails(req: IAppRequest, query: ProcessDetailsDto) {
    const response = await this.getProductionBatchProcessDetails(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getProductionBatchProcessDetails(req: IAppRequest, query: ProcessDetailsDto) {
    let return_data: any = {};
    try {
      if (!query.batchId) throw new Error('Production Batch ID is required');
      if (!query.processExecutionId) throw new Error('Process Execution ID is required');

      const companyId = req.user?.companyId;

      const qb = this.pbProcessRepo.createQueryBuilder('pbp');
      qb.select([
        'pbp.id as id',
        'pbp.processTemplateMappingId as processTemplateMappingId',
        'pbp.processId as processId',
        'pbp.sequenceNumber as sequenceNumber',
        'pbp.status as status',
        'pbp.startTime as startTime',
        'pbp.endTime as endTime',
        'pbp.activeDurationSeconds as activeDurationSeconds',
        'pbp.productionBatchId as productionBatchId',
      ]);
      qb.addSelect('pm.processName', 'processName');
      qb.addSelect('pm.processCode', 'processCode');
      qb.leftJoin('process_master', 'pm', 'pm.id = pbp.processId');
      qb.addSelect(['ptm.nodePosition as nodePosition', 'ptm.dependencies as dependencies', 'ptm.handleConfig as handleConfig']);
      qb.leftJoin('process_template_mapping', 'ptm', 'ptm.id = pbp.processTemplateMappingId');

      qb.innerJoin('production_batch', 'pb', 'pb.id = pbp.productionBatchId');

      qb.where('pbp.id = :processExecutionId', { processExecutionId: query.processExecutionId });
      qb.andWhere('pb.id = :batchId', { batchId: query.batchId });
      if (companyId) qb.andWhere('pb.companyId = :companyId', { companyId });

      const processData = await qb.getRawOne();
      if (!processData) throw new Error('Production Batch Process not found or access denied');

      const items = await this.pbItemRepo
        .createQueryBuilder('pbi')
        .select([
          'pbi.id as id',
          'pbi.productionBatchProcessId as productionBatchProcessId',
          'pbi.itemId as itemId',
          'pbi.materialType as materialType',
          'pbi.requiredQty as requiredQty',
          'pbi.consumedQty as consumedQty',
          'pbi.producedQty as producedQty',
          'pbi.availableStock as availableStock',
          'pbi.shortage as shortage',
          'pbi.requestedQty as requestedQty',
          'pbi.receivedQty as receivedQty',
        ])
        .addSelect(['item.itemName as itemName', 'item.itemCode as itemCode', 'item.costPerUnit as costPerUnit', 'item.currencyCode as currencyCode'])
        .leftJoin('item_master', 'item', 'item.id = pbi.itemId')
        .addSelect('uom.uomName', 'uomName')
        .leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId')
        .addSelect('primaryImage.fileName', 'primaryImageFileName')
        .leftJoin(
          'item_images',
          'primaryImage',
          "primaryImage.itemId = pbi.itemId AND primaryImage.isPrimary = 'Yes' AND primaryImage.sysRecDeleted = 0",
        )
        .where('pbi.productionBatchProcessId = :processExecutionId', { processExecutionId: query.processExecutionId })
        .getRawMany();

      const timelineEventsRaw = await this.pbProcessRepo.manager.createQueryBuilder()
        .select([
          'tl.id AS id',
          'tl.productionBatchProcessId AS productionBatchProcessId',
          'tl.action AS action',
          'tl.actionAt AS actionAt',
          'tl.actionBy AS actionById',
          "CONCAT(u.firstName, ' ', u.lastName) AS actionByName"
        ])
        .from('production_batch_process_timeline', 'tl')
        .leftJoin('users', 'u', 'u.id = tl.actionBy')
        .where('tl.productionBatchProcessId = :processExecutionId', { processExecutionId: query.processExecutionId })
        .orderBy('tl.actionAt', 'ASC')
        .getRawMany();

      const formattedTimelineEvents = await Promise.all(
        timelineEventsRaw.map(async (tl) => ({
          ...tl,
          id: Number(tl.id),
          productionBatchProcessId: Number(tl.productionBatchProcessId),
          actionAtFormatted: tl.actionAt ? await this.general.dateFormat(tl.actionAt) : null,
        }))
      );

      let parsedNodePosition = processData.nodePosition;
      let parsedDependencies = processData.dependencies;
      let parsedHandleConfig = processData.handleConfig;

      try {
        if (typeof parsedNodePosition === 'string') parsedNodePosition = JSON.parse(parsedNodePosition);
      } catch (e) { }
      try {
        if (typeof parsedDependencies === 'string') parsedDependencies = JSON.parse(parsedDependencies);
      } catch (e) { }
      try {
        if (typeof parsedHandleConfig === 'string') parsedHandleConfig = JSON.parse(parsedHandleConfig);
      } catch (e) { }

      const formattedItems: any[] = [];
      for (const i of items) {
        let imageUrl: string | null = null;
        if (i.primaryImageFileName) {
          imageUrl = await this.general.generateUrl('item', `${i.itemId}`, i.primaryImageFileName);
        }
        formattedItems.push({
          ...i,
          id: Number(i.id),
          productionBatchProcessId: Number(i.productionBatchProcessId),
          itemId: Number(i.itemId),
          requiredQty: Number(i.requiredQty || 0),
          consumedQty: Number(i.consumedQty || 0),
          producedQty: Number(i.producedQty || 0),
          availableStock: Number(i.availableStock || 0),
          shortage: Number(i.shortage || 0),
          requestedQty: Number(i.requestedQty || i.requestQty || 0),
          receivedQty: Number(i.receivedQty || 0),
          requiredQtyFormatted: this.general.formatQuantityWithUom(i.requiredQty || 0, i.uomName),
          consumedQtyFormatted: this.general.formatQuantityWithUom(i.consumedQty || 0, i.uomName),
          producedQtyFormatted: this.general.formatQuantityWithUom(i.producedQty || 0, i.uomName),
          availableStockFormatted: this.general.formatQuantityWithUom(i.availableStock || 0, i.uomName),
          shortageFormatted: this.general.formatQuantityWithUom(i.shortage || 0, i.uomName),
          requestedQtyFormatted: this.general.formatQuantityWithUom(i.requestedQty || i.requestQty || 0, i.uomName),
          imageUrl,
        });
      }

      const formattedProcessData = {
        ...processData,
        id: Number(processData.id),
        processId: Number(processData.processId),
        sequenceNumber: Number(processData.sequenceNumber),
        startTime: processData.startTime ? await this.general.dateFormat(processData.startTime) : null,
        endTime: processData.endTime ? await this.general.dateFormat(processData.endTime) : null,
        formattedTimeTaken: this.general.formatDurationSeconds(processData.activeDurationSeconds),
        nodePosition: parsedNodePosition,
        dependencies: parsedDependencies,
        handleConfig: parsedHandleConfig,
        timelineEvents: formattedTimelineEvents,
        items: formattedItems,
      };

      return_data = {
        success: 1,
        message: 'Process details fetched successfully.',
        data: formattedProcessData,
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startProductionBatchDetails(req: IAppRequest, query: ProductionBatchDetailsDto) {
    const response = await this.getProductionBatchDetails(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getProductionBatchDetails(req: IAppRequest, query: ProductionBatchDetailsDto) {
    let return_data: any = {};
    try {
      if (!query.id) throw new Error('Production Batch ID is required');

      const companyId = req.user?.companyId;

      const qb = this.pbRepo.createQueryBuilder('pb');
      qb.select([
        'pb.id AS id',
        'pb.batchCode AS batchCode',
        'pb.batchQuantity AS batchQuantity',
        'pb.producedQuantity AS producedQuantity',
        'pb.status AS status',
        'pb.materialStatus AS materialStatus',
        'pb.addedDate AS addedDate',
        'pb.itemId AS itemId',
        'pb.addedBy AS addedBy',
        'pb.productionOrderId AS productionOrderId',
        'pb.bomId AS bomId',
        'pb.completedBy AS completedBy',
        'pb.completedDate AS completedDate',
      ]);
      qb.addSelect('po.productionOrderCode', 'productionOrderCode');
      qb.addSelect('po.plantId', 'plantId');
      qb.addSelect('po.id', 'productionOrderId');
      qb.addSelect('po.customerId', 'customerId');
      qb.leftJoin('production_order', 'po', 'po.id = pb.productionOrderId');

      qb.addSelect('plant.name', 'plantName');
      qb.addSelect('plant.code', 'plantCode');
      qb.leftJoin('plant_master', 'plant', 'plant.id = po.plantId');

      qb.addSelect('customerCompany.name', 'customerName');
      qb.leftJoin('customer_company', 'customerCompany', 'customerCompany.id = po.customerId');

      qb.addSelect('bom.bomName', 'bomName');
      qb.addSelect('bom.bomCode', 'bomCode');
      qb.addSelect('bom.id', 'bomId');
      qb.addSelect('bom.processTemplateId', 'processTemplateId');
      qb.leftJoin('bom_master', 'bom', 'bom.id = pb.bomId');

      qb.addSelect('pt.templateName', 'processTemplateName');
      qb.leftJoin('process_template', 'pt', 'pt.id = bom.processTemplateId');

      qb.addSelect('item.itemName', 'itemName');
      qb.addSelect('item.itemCode', 'itemCode');
      qb.leftJoin('item_master', 'item', 'item.id = pb.itemId');
      qb.addSelect('uom.uomName', 'uomName');
      qb.leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId');

      qb.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      qb.leftJoin('users', 'addedByUser', 'addedByUser.id = pb.addedBy');

      qb.addSelect("CONCAT(completedByUser.firstName, ' ', completedByUser.lastName)", 'completedByName');
      qb.leftJoin('users', 'completedByUser', 'completedByUser.id = pb.completedBy');

      qb.addSelect('cc.currencyCode', 'companyCurrencyCode');
      qb.leftJoin('company_currency_mapping', 'cc', 'cc.companyId = pb.companyId');

      qb.addSelect('cm.currencySymbol', 'companyCurrencySymbol');
      qb.leftJoin('currency_master', 'cm', 'cm.currencyCode = cc.currencyCode');

      qb.where('pb.id = :id', { id: query.id });
      if (companyId) qb.andWhere('pb.companyId = :companyId', { companyId });

      const batchData = await qb.getRawOne();
      if (!batchData) throw new Error('Production Batch not found');
      batchData.addedDateFormatted = batchData.addedDate ? await this.general.dateFormat(batchData.addedDate) : null;
      batchData.batchQuantityFormatted = this.general.formatQuantityWithUom(batchData.batchQuantity, batchData.uomName);
      batchData.producedQuantityFormatted = this.general.formatQuantityWithUom(batchData.producedQuantity, batchData.uomName);
      batchData.completedDateFormatted = batchData.completedDate ? await this.general.dateFormat(batchData.completedDate) : null;
      const batchSeqNo = await this.pbRepo
        .createQueryBuilder('pb')
        .where('pb.productionOrderId = :poId', { poId: batchData.productionOrderId })
        .andWhere('pb.id <= :id', { id: batchData.id })
        .andWhere('pb.sysRecDeleted = 0')
        .getCount();
      batchData.batchSeqNo = batchSeqNo || 1;

      const processes = await this.pbProcessRepo
        .createQueryBuilder('pbp')
        .select([
          'pbp.id as id',
          'pbp.processTemplateMappingId as processTemplateMappingId',
          'pbp.processId as processId',
          'pbp.sequenceNumber as sequenceNumber',
          'pbp.status as status',
          'pbp.startTime as startTime',
          'pbp.endTime as endTime',
          'pbp.activeDurationSeconds as activeDurationSeconds',
        ])
        .addSelect('pm.processName', 'processName')
        .addSelect('pm.processCode', 'processCode')
        .leftJoin('process_master', 'pm', 'pm.id = pbp.processId')
        .addSelect(['ptm.nodePosition as nodePosition', 'ptm.dependencies as dependencies', 'ptm.handleConfig as handleConfig'])
        .leftJoin('process_template_mapping', 'ptm', 'ptm.id = pbp.processTemplateMappingId')
        .where('pbp.productionBatchId = :batchId', { batchId: query.id })
        .orderBy('pbp.sequenceNumber', 'ASC')
        .getRawMany();

      let items: any[] = [];
      const processIds = processes.map((p) => p.id).filter(Boolean);
      if (processIds.length > 0) {
        items = await this.pbItemRepo
          .createQueryBuilder('pbi')
          .select([
            'pbi.id as id',
            'pbi.productionBatchProcessId as productionBatchProcessId',
            'pbi.itemId as itemId',
            'pbi.materialType as materialType',
            'pbi.requiredQty as requiredQty',
            'pbi.consumedQty as consumedQty',
            'pbi.producedQty as producedQty',
            'pbi.availableStock as availableStock',
            'pbi.shortage as shortage',
            'pbi.requestedQty as requestedQty',
            'pbi.receivedQty as receivedQty',
          ])
          .addSelect(['item.itemName as itemName', 'item.itemCode as itemCode', 'item.costPerUnit as costPerUnit', 'item.currencyCode as currencyCode'])
          .leftJoin('item_master', 'item', 'item.id = pbi.itemId')
          .addSelect('uom.uomName', 'uomName')
          .leftJoin('item_uom_master', 'uom', 'uom.id = item.itemUomId')
          .where('pbi.productionBatchProcessId IN (:...processIds)', { processIds })
          .getRawMany();
      }

      const itemImageMap = new Map<number, string>();
      const itemIdsSet = new Set(items.map((i) => Number(i.itemId)).filter(Boolean));
      if (batchData?.itemId) {
        itemIdsSet.add(Number(batchData.itemId));
      }
      const allItemIds = Array.from(itemIdsSet);
      if (allItemIds.length > 0) {
        const rawImages = await this.pbItemRepo.manager
          .createQueryBuilder()
          .select(['img.itemId AS itemId', 'img.fileName AS fileName'])
          .from('item_images', 'img')
          .where('img.itemId IN (:...allItemIds)', { allItemIds })
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

      const timelineEventsRaw = await this.pbRepo.manager.createQueryBuilder()
        .select([
          'tl.id AS id',
          'tl.productionBatchProcessId AS productionBatchProcessId',
          'tl.action AS action',
          'tl.actionAt AS actionAt',
          'tl.actionBy AS actionById',
          "CONCAT(u.firstName, ' ', u.lastName) AS actionByName",
          'pm.processName AS processName',
          'pm.id AS processId',
        ])
        .from('production_batch_process_timeline', 'tl')
        .innerJoin('production_batch_process', 'pbp', 'pbp.id = tl.productionBatchProcessId')
        .innerJoin('process_master', 'pm', 'pm.id = pbp.processId')
        .leftJoin('users', 'u', 'u.id = tl.actionBy')
        .where('tl.productionBatchId = :batchId', { batchId: query.id })
        .orderBy('tl.actionAt', 'ASC')
        .getRawMany();

      const formattedTimelineEvents = await Promise.all(
        timelineEventsRaw.map(async (tl) => ({
          ...tl,
          id: Number(tl.id),
          productionBatchProcessId: Number(tl.productionBatchProcessId),
          processId: Number(tl.processId),
          actionById: tl.actionById ? Number(tl.actionById) : null,
          actionAtFormatted: tl.actionAt ? await this.general.dateFormat(tl.actionAt) : null,
        }))
      );

      const structuredProcesses = processes.map((p) => {
        let parsedNodePosition = p.nodePosition;
        let parsedDependencies = p.dependencies;
        let parsedHandleConfig = p.handleConfig;

        try {
          if (typeof parsedNodePosition === 'string') parsedNodePosition = JSON.parse(parsedNodePosition);
        } catch (e) { }
        try {
          if (typeof parsedDependencies === 'string') parsedDependencies = JSON.parse(parsedDependencies);
        } catch (e) { }
        try {
          if (typeof parsedHandleConfig === 'string') parsedHandleConfig = JSON.parse(parsedHandleConfig);
        } catch (e) { }

        return {
          ...p,
          id: Number(p.id),
          processId: Number(p.processId),
          sequenceNumber: Number(p.sequenceNumber),
          nodePosition: parsedNodePosition,
          dependencies: parsedDependencies,
          handleConfig: parsedHandleConfig,
          formattedTimeTaken: this.general.formatDurationSeconds(p.activeDurationSeconds),
          items: items
            .filter((i) => Number(i.productionBatchProcessId) === Number(p.id))
            .map((i) => ({
              ...i,
              id: Number(i.id),
              productionBatchProcessId: Number(i.productionBatchProcessId),
              itemId: Number(i.itemId),
              requiredQty: Number(i.requiredQty || 0),
              consumedQty: Number(i.consumedQty || 0),
              producedQty: Number(i.producedQty || 0),
              availableStock: Number(i.availableStock || 0),
              shortage: Number(i.shortage || 0),
              requestedQty: Number(i.requestedQty || i.requestQty || 0),
              receivedQty: Number(i.receivedQty || 0),
              requiredQtyFormatted: this.general.formatQuantityWithUom(i.requiredQty || 0, i.uomName),
              consumedQtyFormatted: this.general.formatQuantityWithUom(i.consumedQty || 0, i.uomName),
              producedQtyFormatted: this.general.formatQuantityWithUom(i.producedQty || 0, i.uomName),
              availableStockFormatted: this.general.formatQuantityWithUom(i.availableStock || 0, i.uomName),
              shortageFormatted: this.general.formatQuantityWithUom(i.shortage || 0, i.uomName),
              requestedQtyFormatted: this.general.formatQuantityWithUom(i.requestedQty || i.requestQty || 0, i.uomName),
              itemImageUrl: itemImageMap.get(Number(i.itemId)) || null,
            })),
        };
      });

      const materialDetails = this.itemCategorizer.categorizeBatchItems(
        items,
        batchData.itemId,
        itemImageMap,
        batchData,
      );

      const processLogs = await this.pbRepo.manager.createQueryBuilder()
        .select([
          'bpl.id AS id',
          'bpl.logType AS logType',
          'bpl.logDate AS logDate',
          'bpl.addedDate AS addedDate',
          'bpl.addedBy AS addedBy',
          'pbp.processId AS processId',
          'bpli.itemId AS itemId',
          'bpli.loggedQty AS loggedQty',
          'pm.processName AS processName',
          'pm.processCode AS processCode',
          'im.itemName AS itemName',
          'im.itemCode AS itemCode',
          'uom.uomName AS uomName',
          "CONCAT(u.firstName, ' ', u.lastName) AS addedByName",
        ])
        .from('batch_process_log', 'bpl')
        .innerJoin('batch_process_log_item', 'bpli', 'bpli.batchProcessLogId = bpl.id')
        .innerJoin('production_batch_process', 'pbp', 'pbp.id = bpl.productionBatchProcessId')
        .innerJoin('process_master', 'pm', 'pm.id = pbp.processId')
        .innerJoin('item_master', 'im', 'im.id = bpli.itemId')
        .leftJoin('item_uom_master', 'uom', 'uom.id = im.itemUomId')
        .leftJoin('users', 'u', 'u.id = bpl.addedBy')
        .where('bpl.productionBatchId = :batchId', { batchId: query.id })
        .orderBy('bpl.addedDate', 'ASC')
        .getRawMany();

      const formattedProcessLogs = await Promise.all(
        processLogs.map(async (log) => ({
          ...log,
          addedDateFormatted: log.addedDate ? await this.general.dateFormat(log.addedDate) : null,
          logDateFormatted: log.logDate ? await this.general.dateFormat(log.logDate, false) : null,
          loggedQty: Number(log.loggedQty || 0),
          loggedQtyFormatted: this.general.formatQuantityWithUom(log.loggedQty || 0, log.uomName),
        })),
      );

      const totalBatchDurationSeconds = processes.reduce((total, p) => {
        return total + (Number(p.activeDurationSeconds) || 0);
      }, 0);


      const companyCurrency = batchData.companyCurrencySymbol;
      const currencyCode = batchData.companyCurrencyCode;


      let totalMaterialCost = 0;
      const materialCostArray = materialDetails.rawMaterials
        .filter((rm) => Number(rm.consumedQty) > 0)
        .map((rm) => {
          const mCost = (Number(rm.consumedQty)) * (Number(rm.costPerUnit));
          totalMaterialCost += mCost;
          return {
            itemId: rm.itemId,
            itemName: rm.itemName,
            uomName: rm.uomName,
            usage: rm.consumedQty,
            usageFormatted: rm.consumedQtyFormatted,
            costPerUnit: rm.costPerUnit,
            costPerUnitFormatted: this.general.formatQuantityWithUom(rm.costPerUnit, rm.uomName, 2,true),
            materialCost: mCost,
            materialCostFormatted: this.general.formatCurrency(mCost),
          };
        });

      // const additionalCost = 0;
      // const scrapCost = 0;
      // const totalCost = totalMaterialCost + additionalCost + scrapCost;



      const batchCost = {
        materialCost: materialCostArray,
        totalMaterialCost: this.general.formatNumber(totalMaterialCost),
        totalMaterialCostFormatted: this.general.formatCurrency(
          totalMaterialCost,
          companyCurrency,
        ),
        currency: companyCurrency,
        currencyCode : currencyCode,
        // additionalCost,
        // scrapCost,
        // totalCost,
      };

      return_data = {
        success: 1,
        message: 'Batch details fetched successfully.',
        data: {
          ...batchData,
          formattedTimeTaken: totalBatchDurationSeconds > 0 ? this.general.formatDurationSeconds(totalBatchDurationSeconds) : null,
          timelineEvents: formattedTimelineEvents,
          processes: structuredProcesses,
          materialDetails,
          processLogs: formattedProcessLogs,
          batchCost,
        },
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }
}
