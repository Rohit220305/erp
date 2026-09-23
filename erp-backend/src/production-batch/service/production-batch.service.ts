import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ProductionBatchEntity } from '../entity/production-batch.entity';
import { ProductionBatchProcessEntity } from '../entity/production-batch-process.entity';
import { ProductionBatchItemEntity } from '../entity/production-batch-item.entity';

import { ProductionBatchAddDto, ProductionBatchDeleteDto, CancelProductionBatchDto } from '../dto/production-batch.dto';
import { ProductionBatchStatus, ProductionBatchProcessStatus, MaterialStatus } from '../enum/production-batch.enum';
import { CompanyEntity } from '../../company/entity/company.entity';
import { ProductionOrderEntity } from '../../production-order/entity/production-order.entity';
import { ProductionOrderStatus } from '../../production-order/enum/production-order.enum';
import { BomEntity } from '../../bom/entity/bom.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { MaterialRequestEntity } from '../../material-request/entity/material-request.entity';
import { MaterialRequestStatus } from '../../material-request/enum/material-request.enum';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

@Injectable()
export class ProductionBatchService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
    private readonly attachmentMasterService: AttachmentMasterService,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
    @InjectRepository(ProductionBatchProcessEntity)
    private readonly pbProcessRepo: Repository<ProductionBatchProcessEntity>,
    @InjectRepository(ProductionBatchItemEntity)
    private readonly pbItemRepo: Repository<ProductionBatchItemEntity>,

    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(ProductionOrderEntity)
    private readonly poRepo: Repository<ProductionOrderEntity>,
    @InjectRepository(BomEntity)
    private readonly bomRepo: Repository<BomEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
    @InjectRepository(MaterialRequestEntity)
    private readonly materialRequestRepo: Repository<MaterialRequestEntity>,
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

  private async generateUniqueBatchCode(
    companyId: number,
    productionOrderId: number,
  ): Promise<string> {
    const po = await this.poRepo.findOne({
      where: { id: productionOrderId, companyId, sysRecDeleted: false },
    });
    if (!po || !po.productionOrderCode) {
      throw new Error(`Production Order (ID: ${productionOrderId}) not found.`);
    }

    const existingCount = await this.pbRepo.count({
      where: {
        productionOrderId,
        companyId,
        sysRecDeleted: false,
      },
    });

    const nextBatchNo = existingCount + 1;
    return `${po.productionOrderCode}/${nextBatchNo}`;
  }

  private async validateCrossTenant(
    companyId: number,
    productionOrderId: number,
    bomId: number,
    itemId?: number,
  ): Promise<void> {
    const po = await this.poRepo.findOne({
      where: { id: productionOrderId, companyId, sysRecDeleted: false },
    });
    if (!po) {
      throw new Error(`Production Order (ID: ${productionOrderId}) does not exist or does not belong to your company.`);
    }

    const bom = await this.bomRepo.findOne({
      where: { id: bomId, companyId, sysRecDeleted: false },
    });
    if (!bom) {
      throw new Error(`BOM (ID: ${bomId}) does not exist or does not belong to your company.`);
    }

    if (itemId) {
      const item = await this.itemRepo.findOne({
        where: { id: itemId, companyId, sysRecDeleted: false },
      });
      if (!item) {
        throw new Error(`Item (ID: ${itemId}) does not exist or does not belong to your company.`);
      }
    }
  }


  async startInsertProductionBatch(req: IAppRequest, params: ProductionBatchAddDto) {
    const response = await this.insertProductionBatch(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async insertProductionBatch(req: IAppRequest, params: ProductionBatchAddDto) {
    let return_data: any = {};
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user?.companyId;
      }

      if (!params.companyId) {
        throw new Error('Company ID is required');
      }

      await this.validateCrossTenant(
        params.companyId,
        params.productionOrderId,
        params.bomId,
        params.itemId,
      );

      let finalBatchCode = params.batchCode ? params.batchCode.trim() : '';

      if (!finalBatchCode) {
        finalBatchCode = await this.generateUniqueBatchCode(
          params.companyId,
          params.productionOrderId,
        );
      } else {
        const codeExists = await this.pbRepo.findOne({
          where: {
            batchCode: finalBatchCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        if (codeExists) {
          throw new Error(`Batch Code '${finalBatchCode}' already exists for this company.`);
        }
      }

      const { processes, ...dbInsertData } = params as any;

      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null || dbInsertData[key] === '') {
          delete dbInsertData[key];
        }
      });

      dbInsertData.batchCode = finalBatchCode;
      dbInsertData.addedBy = req.user?.sub || null;
      dbInsertData.addedDate = new Date();
      dbInsertData.status = ProductionBatchStatus.Pending;
      dbInsertData.materialStatus = MaterialStatus.YetToOrder;
      dbInsertData.markCompleted = false;

      let po: ProductionOrderEntity | null = null;
      if (!dbInsertData.itemId && params.productionOrderId) {
        po = await this.poRepo.findOne({ where: { id: params.productionOrderId } });
        if (!po) {
          throw new Error('Production Order not found.');
        }
        if (params.batchQuantity > po.pendingQuantity) {
          throw new Error(`Batch quantity (${params.batchQuantity}) cannot exceed pending quantity (${po.pendingQuantity}).`);
        }
        if (po.itemId) {
          dbInsertData.itemId = po.itemId;
        }
      } else if (params.productionOrderId) {
        po = await this.poRepo.findOne({ where: { id: params.productionOrderId } });
        if (!po) {
          throw new Error('Production Order not found.');
        }
        if (params.batchQuantity > po.pendingQuantity) {
          throw new Error(`Batch quantity (${params.batchQuantity}) cannot exceed pending quantity (${po.pendingQuantity}).`);
        }
      }

      const masterRes = await this.pbRepo.insert(dbInsertData);
      const batchInsertId = masterRes?.raw?.insertId;

      if (!batchInsertId) {
        throw new Error('Failed to insert master production batch record.');
      }

      if (po) {
        po.pendingQuantity = parseFloat((po.pendingQuantity - params.batchQuantity).toFixed(4));
        po.status = ProductionOrderStatus.InProgress;
        await this.poRepo.save(po);
      }

      if (processes && Array.isArray(processes) && processes.length > 0) {
        for (const process of processes) {
          const processData = {
            companyId: params.companyId,
            productionBatchId: batchInsertId,
            processTemplateMappingId: process.processTemplateMappingId,
            processId: process.processId,
            sequenceNumber: process.sequenceNumber,
            status: ProductionBatchProcessStatus.YetToStart,
          };

          const processRes = await this.pbProcessRepo.insert(processData);
          const processInsertId = processRes?.raw?.insertId;
          if (processInsertId && process.items && Array.isArray(process.items) && process.items.length > 0) {
            const processItemsData = process.items.map((item) => ({

              companyId: params.companyId,
              productionBatchProcessId: processInsertId,
              itemId: item.itemId,
              materialType: item.materialType,
              requiredQty: item.requiredQty,
              shortage: item.shortage,
              requestedQty: 0,
              consumedQty: 0,
              producedQty: 0,
              availableStock: 0,
            }));
            await this.pbItemRepo.insert(processItemsData);
          }
        }
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_BATCH_CREATE',
        'PRODUCTION_BATCH',
        batchInsertId,
        finalBatchCode,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Production Batch created successfully.',
        data: { insertId: batchInsertId },
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

  async startDeleteProductionBatch(req: IAppRequest, params: ProductionBatchDeleteDto) {
    const response = await this.deleteProductionBatch(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async deleteProductionBatch(req: IAppRequest, params: ProductionBatchDeleteDto) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Production Batch ID is required for deletion');
      }

      const existingBatch = await this.pbRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingBatch) {
        throw new Error('Production Batch not found');
      }

      this.general.assertCompanyAccess(req, existingBatch.companyId, 'delete', 'Production Batch');

      await this.pbRepo.update({ id: params.id }, { sysRecDeleted: true });

      const po = await this.poRepo.findOne({ where: { id: existingBatch.productionOrderId } });
      if (po) {
        po.pendingQuantity = parseFloat((po.pendingQuantity + existingBatch.batchQuantity).toFixed(4));
        
        const activeBatchesCount = await this.pbRepo.count({
          where: {
            productionOrderId: existingBatch.productionOrderId,
            sysRecDeleted: false,
          }
        });

        if (activeBatchesCount === 0) {
          po.status = ProductionOrderStatus.Pending;
        }
        await this.poRepo.save(po);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_BATCH_DELETE',
        'PRODUCTION_BATCH',
        params.id,
        existingBatch.batchCode,
        existingBatch.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Production Batch deleted successfully.',
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

  async startCancelProductionBatch(req: IAppRequest, params: CancelProductionBatchDto) {
    const response = await this.cancelProductionBatch(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async cancelProductionBatch(req: IAppRequest, params: CancelProductionBatchDto) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Production Batch ID is required for cancellation');
      }

      const existingBatch = await this.pbRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingBatch) {
        throw new Error('Production Batch not found');
      }

      this.general.assertCompanyAccess(req, existingBatch.companyId, 'update', 'Production Batch');

      if (
        existingBatch.status !== ProductionBatchStatus.Pending &&
        existingBatch.status !== ProductionBatchStatus.StockReceived
      ) {
        throw new Error(`Cannot cancel batch in ${existingBatch.status} status.`);
      }

      // 1. Set batch status to Cancelled
      existingBatch.status = ProductionBatchStatus.Cancelled;
      existingBatch.updatedBy = req.user?.sub || null;
      existingBatch.updatedDate = new Date();
      await this.pbRepo.save(existingBatch);


      // 3. Log activity
      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_BATCH_CANCEL',
        'PRODUCTION_BATCH',
        params.id,
        existingBatch.batchCode,
        existingBatch.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Production Batch cancelled successfully.',
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
}

