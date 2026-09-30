import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductionOrderEntity } from '../entity/production-order.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { BomEntity } from '../../bom/entity/bom.entity';
import { GeneralUtilities } from '../../package/utilities/general.utilities';
import { ActivityLogService } from '../../activity-log/service/activity-log.service';
import { AttachmentMasterService } from '../../attachment-master/service/attachment-master.service';
import { AttachmentModule } from '../../attachment-master/enums/attachment-module.enum';
import { AppRequest } from '../../package/types/app-request.type';
import {
  ProductionOrderAddDto,
  ProductionOrderDeleteDto,
  ProductionOrderUpdateDto,
  CancelProductionOrderDto,
} from '../dto/production-order.dto';
import { ProductionOrderStatus } from '../enum/production-order.enum';
import { ProductionBatchEntity } from '../../production-batch/entity/production-batch.entity';
import { ProductionBatchStatus } from '../../production-batch/enum/production-batch.enum';
import { MaterialRequestEntity } from '../../material-request/entity/material-request.entity';
import { MaterialRequestStatus } from '../../material-request/enum/material-request.enum';

@Injectable()
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrderEntity)
    private readonly poRepo: Repository<ProductionOrderEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
    @InjectRepository(BomEntity)
    private readonly bomRepo: Repository<BomEntity>,
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
    private readonly attachmentMasterService: AttachmentMasterService,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
    @InjectRepository(MaterialRequestEntity)
    private readonly materialRequestRepo: Repository<MaterialRequestEntity>,
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
        data: params?.data !== undefined ? params.data : [],
      },
    };
    if (incomingData) output.settings.incoming_data = incomingData;
    return output;
  }

  async validateCrossTenant(
    companyId: number,
    itemId: number,
    bomId: number,
    plantId?: number | null,
    customerId?: number | null,
  ) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId, companyId, sysRecDeleted: false },
    });
    if (!item) {
      throw new Error(`Invalid Item ID ${itemId} for this company.`);
    }

    const bom = await this.bomRepo.findOne({
      where: { id: bomId, companyId, sysRecDeleted: false },
    });
    if (!bom) {
      throw new Error(`Invalid BOM ID ${bomId} for this company.`);
    }

    if (bom.itemId !== itemId) {
      throw new Error(
        `Selected BOM (ID: ${bomId}) does not belong to the selected Item (ID: ${itemId}).`,
      );
    }

    if (plantId) {
    }

    if (customerId) {
    }
  }

  private async generateUniqueProductionOrderCode(
    companyId: number,
  ): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `PO/${year}/${month}/`;

    const lastRecord = await this.poRepo
      .createQueryBuilder('po')
      .select('po.productionOrderCode', 'code')
      .where('po.companyId = :companyId', { companyId })
      .andWhere('po.productionOrderCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('po.id', 'DESC')
      .getRawOne();

    let nextSeq = 1;
    if (lastRecord && lastRecord.code) {
      const parts = lastRecord.code.split('/');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(5, '0')}`;
  }

  async startInsertProductionOrder(
    req: AppRequest,
    params: ProductionOrderAddDto,
    files?: any[],
  ) {
    const response = await this.insertProductionOrder(req, params, files);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async insertProductionOrder(
    req: AppRequest,
    params: ProductionOrderAddDto,
    files?: any[],
  ) {
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user?.companyId;
      }

      if (!params.companyId) {
        throw new Error('Company ID is required');
      }

      await this.validateCrossTenant(
        params.companyId,
        params.itemId,
        params.bomId,
        params.plantId,
        params.customerId,
      );

      const numProductionQty = parseFloat(
        String(params.productionQuantity || 0),
      );
      if (isNaN(numProductionQty) || numProductionQty <= 0) {
        throw new Error('Production Quantity must be greater than 0');
      }

      let insertId: number | null = null;
      let finalCode = '';
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && !insertId) {
        attempts++;
        finalCode = await this.generateUniqueProductionOrderCode(
          params.companyId,
        );

        try {
          const dbInsertData: any = {
            companyId: params.companyId,
            productionOrderCode: finalCode,
            bomId: params.bomId,
            itemId: params.itemId,
            productionQuantity: numProductionQty,
            pendingQuantity: numProductionQty,
            referenceNumber: params.referenceNumber?.trim() || null,
            productionDate: new Date(params.productionDate),
            remark: params.remark?.trim() || null,
            plantId: params.plantId || null,
            customerId: params.customerId || null,
            status: params.status || ProductionOrderStatus.Pending,
            addedBy: req.user?.sub || null,
            addedDate: new Date(),
          };

          const res = await this.poRepo.insert(dbInsertData);
          insertId = res?.raw?.insertId || null;
        } catch (dbErr: any) {
          if (dbErr.code === 'ER_DUP_ENTRY' && attempts < maxAttempts) {
            continue;
          }
          throw dbErr;
        }
      }

      if (!insertId) {
        throw new Error(
          'Failed to generate unique Production Order code after multiple attempts.',
        );
      }

      let attachmentMessage = '';
      if (files && files.length > 0) {
        try {
          const syncRes =
            await this.attachmentMasterService.syncMultipleAttachments(
              params.companyId,
              AttachmentModule.PRODUCTION_ORDER,
              insertId,
              [],
              files,
            );
          if (syncRes.success === 0) {
            attachmentMessage =
              ' Production Order created successfully, but attachments failed to save.';
          }
        } catch {
          attachmentMessage =
            ' Production Order created successfully, but attachments failed to save.';
        }
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_ORDER_CREATE',
        'PRODUCTION_ORDER',
        insertId,
        finalCode,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return {
        success: 1,
        message: 'Production Order created successfully.' + attachmentMessage,
        data: { id: insertId, productionOrderCode: finalCode },
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return { success: 0, message: err.message };
    }
  }

  async startUpdateProductionOrder(
    req: AppRequest,
    params: ProductionOrderUpdateDto,
    files?: any[],
  ) {
    const response = await this.updateProductionOrder(req, params, files);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async updateProductionOrder(
    req: AppRequest,
    params: ProductionOrderUpdateDto,
    files?: any[],
  ) {
    try {
      if (!params.id) throw new Error('Production Order ID is required');

      const existingPO = await this.poRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });
      if (!existingPO) throw new Error('Production Order not found');

      const [batchRes] = await this.poRepo.manager.query(
        `SELECT COUNT(id) as cnt FROM production_batch WHERE productionOrderId = ? AND sysRecDeleted = 0 AND status != 'Cancelled'`,
        [params.id],
      );
      if (parseInt(batchRes?.cnt || '0', 10) > 0) {
        throw new Error(
          'Cannot edit Production Order once a batch has been created.',
        );
      }

      this.general.assertCompanyAccess(
        req,
        existingPO.companyId,
        'update',
        'Production Order',
      );

      const targetCompanyId = this.general.isSuperAdmin(req)
        ? params.companyId || existingPO.companyId
        : req.user?.companyId || existingPO.companyId;

      await this.validateCrossTenant(
        targetCompanyId,
        params.itemId,
        params.bomId,
        params.plantId,
        params.customerId,
      );

      const numProductionQty = parseFloat(
        String(params.productionQuantity || 0),
      );
      if (isNaN(numProductionQty) || numProductionQty <= 0) {
        throw new Error('Production Quantity must be greater than 0');
      }

      let retainedList: number[] = [];
      if (params.retainedAttachments) {
        try {
          retainedList = JSON.parse(params.retainedAttachments);
        } catch {
          retainedList = [];
        }
      }

      const updatePayload: any = {
        companyId: targetCompanyId,
        bomId: params.bomId,
        itemId: params.itemId,
        productionQuantity: numProductionQty,
        pendingQuantity: numProductionQty,
        referenceNumber: params.referenceNumber?.trim() || null,
        productionDate: new Date(params.productionDate),
        remark: params.remark?.trim() || null,
        plantId: params.plantId || null,
        customerId: params.customerId || null,
        status: params.status || existingPO.status,
        updatedBy: req.user?.sub || null,
        updatedDate: new Date(),
      };

      await this.poRepo.update({ id: params.id }, updatePayload);

      let attachmentMessage = '';
      if (
        (files && files.length > 0) ||
        params.retainedAttachments !== undefined
      ) {
        try {
          const syncRes =
            await this.attachmentMasterService.syncMultipleAttachments(
              targetCompanyId,
              AttachmentModule.PRODUCTION_ORDER,
              params.id,
              retainedList,
              files || [],
            );
          if (syncRes.success === 0) {
            attachmentMessage = ` Production Order updated, but attachment sync failed: ${syncRes.message}`;
          }
        } catch (syncErr: any) {
          attachmentMessage = ` Production Order updated, but attachment sync failed: ${syncErr?.message || syncErr}`;
        }
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_ORDER_UPDATE',
        'PRODUCTION_ORDER',
        params.id,
        existingPO.productionOrderCode,
        targetCompanyId,
      );
      await this.activityLogService.log(logPayload);

      return {
        success: 1,
        message: 'Production Order updated successfully.' + attachmentMessage,
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return { success: 0, message: err.message };
    }
  }

  async startDeleteProductionOrder(
    req: AppRequest,
    query: ProductionOrderDeleteDto,
  ) {
    const response = await this.deleteProductionOrder(req, query);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async deleteProductionOrder(
    req: AppRequest,
    query: ProductionOrderDeleteDto,
  ) {
    try {
      if (!query.id) throw new Error('Production Order ID is required');

      const existingPO = await this.poRepo.findOne({
        where: { id: query.id, sysRecDeleted: false },
      });
      if (!existingPO) throw new Error('Production Order not found');

      this.general.assertCompanyAccess(
        req,
        existingPO.companyId,
        'delete',
        'Production Order',
      );

      await this.poRepo.update(
        { id: query.id },
        {
          sysRecDeleted: true,
          updatedBy: req.user?.sub || null,
          updatedDate: new Date(),
        },
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_ORDER_DELETE',
        'PRODUCTION_ORDER',
        query.id,
        existingPO.productionOrderCode,
        existingPO.companyId,
      );
      await this.activityLogService.log(logPayload);

      return {
        success: 1,
        message: 'Production Order deleted successfully.',
      };
    } catch (err: any) {
      if (err instanceof ForbiddenException) throw err;
      return { success: 0, message: err.message };
    }
  }

  async startCancelProductionOrder(
    req: AppRequest,
    params: CancelProductionOrderDto,
  ) {
    const response = await this.cancelProductionOrder(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async cancelProductionOrder(
    req: AppRequest,
    params: CancelProductionOrderDto,
  ) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Production Order ID is required for cancellation');
      }

      const existingPO = await this.poRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingPO) {
        throw new Error('Production Order not found');
      }

      this.general.assertCompanyAccess(
        req,
        existingPO.companyId,
        'update',
        'Production Order',
      );

      if (
        existingPO.status === ProductionOrderStatus.Completed ||
        existingPO.status === ProductionOrderStatus.Cancelled ||
        existingPO.status === ProductionOrderStatus.PartialCancelled
      ) {
        throw new Error(`Cannot cancel order in ${existingPO.status} status.`);
      }

      if (
        existingPO.status === ProductionOrderStatus.InProgress &&
        existingPO.pendingQuantity <= 0
      ) {
        throw new Error(
          'Cannot cancel an InProgress order with 0 pending quantity.',
        );
      }

      // Fetch all non-deleted batches
      const batches = await this.pbRepo.find({
        where: { productionOrderId: existingPO.id, sysRecDeleted: false },
      });

      const idleBatches = batches.filter(
        (b) =>
          b.status === ProductionBatchStatus.Pending ||
          b.status === ProductionBatchStatus.StockReceived,
      );
      const activeBatches = batches.filter(
        (b) =>
          b.status === ProductionBatchStatus.InProgress ||
          b.status === ProductionBatchStatus.Completed ||
          b.status === ProductionBatchStatus.Processed,
      );


      // Determine final order status
      if (activeBatches.length === 0) {
        existingPO.status = ProductionOrderStatus.Cancelled;
      } else {
        existingPO.status = ProductionOrderStatus.PartialCancelled;
      }

      existingPO.updatedBy = req.user?.sub || null;
      existingPO.updatedDate = new Date();
      await this.poRepo.save(existingPO);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PRODUCTION_ORDER_CANCEL',
        'PRODUCTION_ORDER',
        params.id,
        existingPO.productionOrderCode,
        existingPO.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Production Order cancelled successfully.',
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
