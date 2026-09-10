import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';
import { CompanyEntity } from '../../company/entity/company.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ProductionBatchItemEntity } from '../../production-batch/entity/production-batch-item.entity';
import { ProductionBatchProcessEntity } from '../../production-batch/entity/production-batch-process.entity';
import { ProductionBatchEntity } from '../../production-batch/entity/production-batch.entity';
import { MaterialStatus } from '../../production-batch/enum/production-batch.enum';
import {
  CancelMaterialRequestDto,
  CreateMaterialRequestDto,
  MarkMaterialRequestDeliveredDto,
} from '../dto/material-request.dto';
import { MaterialRequestItemEntity } from '../entity/material-request-item.entity';
import { MaterialRequestEntity } from '../entity/material-request.entity';
import { MaterialRequestStatus } from '../enum/material-request.enum';

@Injectable()
export class MaterialRequestService {
  constructor(
    @InjectRepository(MaterialRequestEntity)
    private readonly materialRequestRepo: Repository<MaterialRequestEntity>,
    @InjectRepository(MaterialRequestItemEntity)
    private readonly materialRequestItemRepo: Repository<MaterialRequestItemEntity>,
    @InjectRepository(ProductionBatchEntity)
    private readonly pbRepo: Repository<ProductionBatchEntity>,
    @InjectRepository(ProductionBatchItemEntity)
    private readonly pbItemRepo: Repository<ProductionBatchItemEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(ItemEntity)
    private readonly itemRepo: Repository<ItemEntity>,
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
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

  private async validateMrCrossTenant(
    companyId: number,
    productionBatchId: number,
    items: { itemId: number }[],
  ): Promise<void> {
    const batch = await this.pbRepo.findOne({
      where: { id: productionBatchId, companyId, sysRecDeleted: false },
    });
    if (!batch) {
      throw new Error(`Production Batch (ID: ${productionBatchId}) does not exist or does not belong to your company.`);
    }

    if (items && items.length > 0) {
      const itemIds = Array.from(new Set(items.map((i) => i.itemId)));
      const validItems = await this.itemRepo.find({
        where: { id: In(itemIds), companyId, sysRecDeleted: false },
        select: { id: true },
      });
      if (validItems.length !== itemIds.length) {
        throw new Error(`One or more requested items do not exist or belong to a different company.`);
      }
    }
  }

  async startCreateMaterialRequest(req: IAppRequest, params: CreateMaterialRequestDto, files?: any[]) {
    const response = await this.createMaterialRequest(req, params, files);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async createMaterialRequest(req: IAppRequest, params: CreateMaterialRequestDto, files?: any[]) {
    let return_data: any = {};
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user?.companyId;
      }
      const activeCompanyId = (params as any).companyId || req.user?.companyId;
      if (!activeCompanyId) {
        throw new Error('Company ID is required');
      }

      await this.validateMrCrossTenant(activeCompanyId, params.productionBatchId, params.items);

      const company = await this.companyRepo.findOne({
        where: { id: activeCompanyId, sysRecDeleted: false },
      });
      if (!company) {
        throw new Error('Company not found');
      }

      const prefix = this.general.getCodePrefix(company.companyName, 'MR');
      const lastRecord = await this.materialRequestRepo
        .createQueryBuilder('materialRequest')
        .select('materialRequest.code', 'code')
        .where('materialRequest.companyId = :companyId', { companyId: activeCompanyId })
        .andWhere('materialRequest.code LIKE :prefix', { prefix: `${prefix}%` })
        .andWhere('materialRequest.sysRecDeleted = 0')
        .orderBy('materialRequest.id', 'DESC')
        .getRawOne();

      const code = this.general.generateCode(company.companyName, 'MR', lastRecord?.code);

      const materialRequestInsert = await this.materialRequestRepo.insert({
        companyId: activeCompanyId,
        productionBatchId: params.productionBatchId,
        code,
        remark: params.remark || null,
        status: MaterialRequestStatus.Pending,
        requestedBy: req.user?.sub || 0,
        requestedDate: new Date(),
      });
      const materialRequestId = materialRequestInsert?.raw?.insertId;

      if (!materialRequestId) {
        throw new Error('Failed to create Material Request record.');
      }

      for (const item of params.items) {
        const requestedQty = Number(item.requestedQty) || 0;
        await this.materialRequestItemRepo.insert({
          companyId: activeCompanyId,
          materialRequestId,
          itemId: item.itemId,
          requestedQty,
          receivedQty: 0,
        });

        const pbItems = await this.pbItemRepo
          .createQueryBuilder('pbi')
          .innerJoin(ProductionBatchProcessEntity, 'pbp', 'pbp.id = pbi.productionBatchProcessId')
          .where('pbp.productionBatchId = :pbId', { pbId: params.productionBatchId })
          .andWhere('pbi.itemId = :itemId', { itemId: item.itemId })
          .getMany();

        for (const pbItem of pbItems) {
          const currentReqQty = Number(pbItem.requestQty) || 0;
          await this.pbItemRepo.update(pbItem.id, {
            requestQty: currentReqQty + requestedQty,
          });
        }
      }

      await this.pbRepo.update(params.productionBatchId, {
        materialStatus: MaterialStatus.OrderPlaced,
        updatedBy: req.user?.sub || null,
        updatedDate: new Date(),
      });

      if (files && files.length > 0) {
        try {
          await this.attachmentMasterService.syncMultipleAttachments(
            activeCompanyId,
            AttachmentModule.MATERIAL_REQUEST,
            materialRequestId,
            [],
            files,
          );
        } catch (e) {}
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'MATERIAL_REQUEST_CREATE',
        'MATERIAL_REQUEST',
        materialRequestId,
        code,
        activeCompanyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Material Request created successfully.',
        data: { insertId: materialRequestId, code },
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

  async startMarkMaterialRequestDelivered(req: IAppRequest, params: MarkMaterialRequestDeliveredDto) {
    const response = await this.markMaterialRequestDelivered(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async markMaterialRequestDelivered(req: IAppRequest, params: MarkMaterialRequestDeliveredDto) {
    let return_data: any = {};
    try {
      const targetMaterialRequestId = params.id || (params as any).materialRequestId;
      if (!targetMaterialRequestId) {
        throw new Error('Material Request ID is required');
      }

      const materialRequest = await this.materialRequestRepo.findOne({
        where: { id: targetMaterialRequestId, sysRecDeleted: false },
      });
      if (!materialRequest) {
        throw new Error('Material Request not found');
      }

      this.general.assertCompanyAccess(req, materialRequest.companyId, 'update', 'Material Request');

      if (materialRequest.status === MaterialRequestStatus.Delivered) {
        throw new Error('Material Request is already marked as Delivered.');
      }
      if (materialRequest.status === MaterialRequestStatus.Cancelled) {
        throw new Error('Cannot mark a Cancelled Material Request as Delivered.');
      }

      const materialRequestItems = await this.materialRequestItemRepo.find({
        where: { materialRequestId: materialRequest.id },
      });

      for (const materialRequestItem of materialRequestItems) {
        const requestedQty = Number(materialRequestItem.requestedQty) || 0;

        const pbItems = await this.pbItemRepo
          .createQueryBuilder('pbi')
          .innerJoin(ProductionBatchProcessEntity, 'pbp', 'pbp.id = pbi.productionBatchProcessId')
          .where('pbp.productionBatchId = :pbId', { pbId: materialRequest.productionBatchId })
          .andWhere('pbi.itemId = :itemId', { itemId: materialRequestItem.itemId })
          .getMany();

        for (const pbItem of pbItems) {
          const currentAvail = Number(pbItem.availableStock) || 0;
          const requiredQty = Number(pbItem.requiredQty) || 0;
          const newAvail = currentAvail + requestedQty;
          const newShortage = Math.max(0, requiredQty - newAvail);

          await this.pbItemRepo.update(pbItem.id, {
            availableStock: newAvail,
            shortage: newShortage,
          });
        }

        await this.materialRequestItemRepo.update(materialRequestItem.id, {
          receivedQty: requestedQty,
        });
      }

      await this.materialRequestRepo.update(materialRequest.id, {
        status: MaterialRequestStatus.Delivered,
        deliveredDate: new Date(),
      });

      const allPbItems = await this.pbItemRepo
        .createQueryBuilder('pbi')
        .innerJoin(ProductionBatchProcessEntity, 'pbp', 'pbp.id = pbi.productionBatchProcessId')
        .where('pbp.productionBatchId = :pbId', { pbId: materialRequest.productionBatchId })
        .getMany();

      const totalShortage = allPbItems.reduce((acc, item) => acc + (Number(item.shortage) || 0), 0);
      const updatedMaterialStatus = totalShortage === 0 ? MaterialStatus.OrderReceived : MaterialStatus.OrderPartiallyReceived;

      await this.pbRepo.update(materialRequest.productionBatchId, {
        materialStatus: updatedMaterialStatus,
        updatedBy: req.user?.sub || null,
        updatedDate: new Date(),
      });

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'MATERIAL_REQUEST_DELIVERED',
        'MATERIAL_REQUEST',
        materialRequest.id,
        materialRequest.code,
        materialRequest.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Material Request marked as Delivered successfully.',
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

  async startCancelMaterialRequest(req: IAppRequest, params: CancelMaterialRequestDto) {
    const response = await this.cancelMaterialRequest(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async cancelMaterialRequest(req: IAppRequest, params: CancelMaterialRequestDto) {
    let return_data: any = {};
    try {
      const targetMaterialRequestId = params.id || (params as any).materialRequestId;
      if (!targetMaterialRequestId) {
        throw new Error('Material Request ID is required');
      }

      const materialRequest = await this.materialRequestRepo.findOne({
        where: { id: targetMaterialRequestId, sysRecDeleted: false },
      });
      if (!materialRequest) {
        throw new Error('Material Request not found');
      }

      this.general.assertCompanyAccess(req, materialRequest.companyId, 'update', 'Material Request');

      if (materialRequest.status === MaterialRequestStatus.Cancelled) {
        throw new Error('Material Request is already Cancelled.');
      }
      if (materialRequest.status === MaterialRequestStatus.Delivered) {
        throw new Error('Cannot cancel a Delivered Material Request.');
      }

      const materialRequestItems = await this.materialRequestItemRepo.find({
        where: { materialRequestId: materialRequest.id },
      });

      for (const materialRequestItem of materialRequestItems) {
        const requestedQty = Number(materialRequestItem.requestedQty) || 0;

        const pbItems = await this.pbItemRepo
          .createQueryBuilder('pbi')
          .innerJoin(ProductionBatchProcessEntity, 'pbp', 'pbp.id = pbi.productionBatchProcessId')
          .where('pbp.productionBatchId = :pbId', { pbId: materialRequest.productionBatchId })
          .andWhere('pbi.itemId = :itemId', { itemId: materialRequestItem.itemId })
          .getMany();

        for (const pbItem of pbItems) {
          const currentReqQty = Number(pbItem.requestQty) || 0;
          const newReqQty = Math.max(0, currentReqQty - requestedQty);

          await this.pbItemRepo.update(pbItem.id, {
            requestQty: newReqQty,
          });
        }
      }

      await this.materialRequestRepo.update(materialRequest.id, {
        status: MaterialRequestStatus.Cancelled,
      });

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'MATERIAL_REQUEST_CANCEL',
        'MATERIAL_REQUEST',
        materialRequest.id,
        materialRequest.code,
        materialRequest.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Material Request cancelled successfully.',
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
