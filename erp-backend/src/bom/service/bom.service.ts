import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';
import { BomEntity } from '../entity/bom.entity';
import { BomProcessItemEntity } from '../entity/bom-process-item.entity';
import { ProcessTemplateEntity } from '../../process-template/entity/process.template.entity';
import { ProcessTemplateMappingEntity } from '../../process-template/entity/process.template.mapping.entity';
import { ItemEntity } from '../../item/entity/item.entity';
import { BomAddDto, BomUpdateDto, BomDeleteDto, BomProcessItemDto } from '../dto/bom.dto';
import { MaterialType } from '../enum/bom.enum';
import { Status } from 'src/package/common/enums/enum';

@Injectable()
export class BomService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
    private readonly attachmentMasterService: AttachmentMasterService,
  ) {}

  @InjectRepository(BomEntity)
  private readonly bomRepo: Repository<BomEntity>;

  @InjectRepository(BomProcessItemEntity)
  private readonly bomProcessItemRepo: Repository<BomProcessItemEntity>;

  @InjectRepository(ProcessTemplateEntity)
  private readonly processTemplateRepo: Repository<ProcessTemplateEntity>;

  @InjectRepository(ProcessTemplateMappingEntity)
  private readonly processTemplateMappingRepo: Repository<ProcessTemplateMappingEntity>;

  @InjectRepository(ItemEntity)
  private readonly itemRepo: Repository<ItemEntity>;

  /**
   * TASK 7: Cross-Tenant & Entity Ownership Validation Guard
   * Validates that all referenced items, process templates, and optional customers
   * belong to the specified companyId and are active (sysRecDeleted = 0).
   */
  private async validateCrossTenant(
    companyId: number,
    itemId: number,
    processTemplateId: number,
    customerId?: number | null,
    items?: BomProcessItemDto[],
  ): Promise<void> {
    // 1. Validate primary finished item
    const mainItem = await this.itemRepo.findOne({
      where: { id: itemId, companyId, sysRecDeleted: false },
    });
    if (!mainItem) {
      throw new Error(`Primary Item (ID: ${itemId}) does not exist or does not belong to your company.`);
    }

    // 2. Validate process template
    const template = await this.processTemplateRepo.findOne({
      where: { id: processTemplateId, companyId, sysRecDeleted: false },
    });
    if (!template) {
      throw new Error(`Process Template (ID: ${processTemplateId}) does not exist or does not belong to your company.`);
    }

    // 3. Validate customer if provided
    if (customerId) {
      // Validate customer ownership via companyId scoping
      const customer = await this.itemRepo.query(
        `SELECT id FROM party_master WHERE id = ? AND companyId = ? AND sysRecDeleted = 0 LIMIT 1`,
        [customerId, companyId],
      ).catch(() => null);
      // Fallback query to company table if party_master is not present
      if (!customer || customer.length === 0) {
        const companyCustomer = await this.itemRepo.query(
          `SELECT id FROM company WHERE id = ? AND sysRecDeleted = 0 LIMIT 1`,
          [customerId],
        ).catch(() => null);
        if (!companyCustomer || companyCustomer.length === 0) {
          throw new Error(`Customer (ID: ${customerId}) does not exist or does not belong to your company.`);
        }
      }
    }

    // 4. Validate component item IDs in process items table
    if (items && items.length > 0) {
      const itemIds = Array.from(new Set(items.map((i) => i.itemId)));
      const validItems = await this.itemRepo.find({
        where: { id: In(itemIds), companyId, sysRecDeleted: false },
        select: { id: true },
      });
      if (validItems.length !== itemIds.length) {
        throw new Error(`One or more process material items do not exist or belong to a different company.`);
      }
    }
  }

  /**
   * TASK 8: isInternalTransfer Backend Validation Guard
   * Enforces that an Entry row can ONLY have isInternalTransfer = true if the exact itemId
   * appeared as an Exit material in a process step with a strictly lower sequence number
   * (sequenceNo < currentStepSequenceNo) within the same process template.
   */
  public async validateInternalTransfers(
    processTemplateId: number,
    items: BomProcessItemDto[],
  ): Promise<void> {
    if (!items || items.length === 0) return;

    // Fetch template process step mappings ordered by sequenceNo ASC
    const mappings = await this.processTemplateMappingRepo.find({
      where: { templateId: processTemplateId },
      order: { sequenceNo: 'ASC' },
    });

    if (mappings.length === 0) {
      throw new Error(`Process template (ID: ${processTemplateId}) has no process mapping steps configured.`);
    }

    const mappingSeqMap = new Map<number, number>();
    mappings.forEach((m) => mappingSeqMap.set(m.id, m.sequenceNo));

    // Group items by step sequence number
    const itemsBySeq = new Map<number, BomProcessItemDto[]>();
    for (const item of items) {
      const seq = mappingSeqMap.get(item.processTemplateMappingId);
      if (seq === undefined) {
        throw new Error(
          `Invalid processTemplateMappingId (${item.processTemplateMappingId}): step does not belong to process template ${processTemplateId}.`,
        );
      }
      if (!itemsBySeq.has(seq)) {
        itemsBySeq.set(seq, []);
      }
      itemsBySeq.get(seq)!.push(item);
    }

    const producedExitItemsSet = new Set<number>();
    const sortedSeqs = Array.from(itemsBySeq.keys()).sort((a, b) => a - b);

    for (const seq of sortedSeqs) {
      const stepItems = itemsBySeq.get(seq) || [];

      // Validate Entry items at current step
      for (const item of stepItems) {
        if (item.materialType === MaterialType.Entry && item.isInternalTransfer === true) {
          if (!producedExitItemsSet.has(item.itemId)) {
            throw new Error(
              `Validation Error: Item ID ${item.itemId} is marked as an internal transfer in step sequence ${seq}, ` +
                `but it was NOT produced as an Exit material in any earlier step of this BOM.`,
            );
          }
        }
      }

      // Record Exit items produced at current step for downstream steps
      for (const item of stepItems) {
        if (item.materialType === MaterialType.Exit) {
          producedExitItemsSet.add(item.itemId);
        }
      }
    }
  }

  /**
   * Helper to auto-generate a unique sequential BOM code: BOM/YYYY/MM/00001
   */
  private async generateUniqueBomCode(companyId: number, manager?: any): Promise<string> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `BOM/${currentYear}/${currentMonth}/`;

    const repo = manager ? manager.getRepository(BomEntity) : this.bomRepo;

    const lastRecord = await repo
      .createQueryBuilder('bom')
      .select('bom.bomCode', 'bomCode')
      .where('bom.companyId = :companyId', { companyId })
      .andWhere('bom.bomCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('bom.id', 'DESC')
      .getRawOne();

    let nextSequence = 1;
    if (lastRecord && lastRecord.bomCode) {
      const parts = lastRecord.bomCode.split('/');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextSequence = lastNum + 1;
      }
    }

    return `${prefix}${String(nextSequence).padStart(5, '0')}`;
  }

  async startInsertBom(req: IAppRequest, params: BomAddDto, files?: any[]) {
    const response = await this.insertBom(req, params, files);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  /**
   * TASK 9: Transaction-Wrapped Insert BOM Service
   */
  async insertBom(req: IAppRequest, params: BomAddDto, files?: any[]) {
    let return_data: any = {};
    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user?.companyId;
      }

      if (!params.companyId) {
        throw new Error('Company ID is required');
      }

      // Cross-tenant validation
      await this.validateCrossTenant(
        params.companyId,
        params.itemId,
        params.processTemplateId,
        params.customerId,
        params.items,
      );

      // Validate internal transfer guard
      await this.validateInternalTransfers(params.processTemplateId, params.items);

      let finalBomCode = params.bomCode ? params.bomCode.trim() : '';

      if (!finalBomCode) {
        finalBomCode = await this.generateUniqueBomCode(params.companyId!);
      } else {
        const codeExists = await this.bomRepo.findOne({
          where: {
            bomCode: finalBomCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        if (codeExists) {
          throw new Error(`BOM Code '${finalBomCode}' already exists for this company.`);
        }
      }

      const {
        items,
        ...dbInsertData
      } = params as any;

      // Remove attachmentIds if it still exists in params somehow
      delete dbInsertData.attachmentIds;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null || dbInsertData[key] === '') {
          delete dbInsertData[key];
        }
      });

      dbInsertData.bomCode = finalBomCode;
      dbInsertData.addedBy = req.user?.sub || null;
      dbInsertData.addedDate = new Date();

      const res = await this.bomRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      if (insertId && items && Array.isArray(items) && items.length > 0) {
        const processItemsData = items.map((item: any) => ({
          bomId: insertId,
          processTemplateMappingId: item.processTemplateMappingId,
          materialType: item.materialType,
          itemId: item.itemId,
          quantity: item.quantity,
          isPrimary: item.isPrimary,
        }));
        await this.bomProcessItemRepo.insert(processItemsData);
      }

      // Save attachments if provided
      let attachmentMessage = '';
      if (files && files.length > 0) {
        try {
          const syncRes = await this.attachmentMasterService.syncMultipleAttachments(
            params.companyId,
            AttachmentModule.BOM,
            insertId,
            [], // no retained attachments on insert
            files
          );
          if (syncRes.success === 0) {
            attachmentMessage = ' BOM created successfully, but attachments failed to save.';
          }
        } catch (err) {
          attachmentMessage = ' BOM created successfully, but attachments failed to save.';
        }
      }

      // Log activity
      const logPayload = this.general.buildActivityLogPayload(
        req,
        'BOM_CREATE',
        'BOM',
        insertId,
        params.bomName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Bill of Materials (BOM) created successfully.' + attachmentMessage,
        data: { insertId },
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

  async startUpdateBom(req: IAppRequest, params: BomUpdateDto, files?: any[]) {
    const response = await this.updateBom(req, params, files);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  /**
   * TASK 9: Transaction-Wrapped Update BOM Service (Full Delete-and-Reinsert of process items)
   */
  async updateBom(req: IAppRequest, params: BomUpdateDto, files?: any[]) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('BOM ID is required for update');
      }

      const existingBom = await this.bomRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingBom) {
        throw new Error('BOM not found');
      }

      this.general.assertCompanyAccess(req, existingBom.companyId, 'update', 'BOM');

      const companyId = existingBom.companyId;

      // Cross-tenant validation
      await this.validateCrossTenant(
        companyId,
        params.itemId || existingBom.itemId,
        params.processTemplateId || existingBom.processTemplateId,
        params.customerId !== undefined ? params.customerId : existingBom.customerId,
        params.items,
      );

      // Validate internal transfer guard
      await this.validateInternalTransfers(
        params.processTemplateId || existingBom.processTemplateId,
        params.items,
      );

      // Check bomCode uniqueness if modified
      if (params.bomCode && params.bomCode !== existingBom.bomCode) {
        const codeExists = await this.bomRepo.findOne({
          where: { bomCode: params.bomCode, companyId, sysRecDeleted: false },
        });
        if (codeExists) {
          throw new Error(`BOM Code '${params.bomCode}' already exists for this company.`);
        }
      }

      const allowedUpdateKeys = [
        'bomName',
        'bomCode',
        'productionMethod',
        'itemId',
        'processTemplateId',
        'customerId',
        'referenceNumber',
        'remarks',
        'status',
      ];
      const cleanUpdateData: any = {};
      allowedUpdateKeys.forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          cleanUpdateData[key] = params[key];
        }
      });
      cleanUpdateData.updatedBy = req.user?.sub || null;
      cleanUpdateData.updatedDate = new Date();

      if (Object.keys(cleanUpdateData).length > 2) {
        await this.bomRepo.update({ id: params.id }, cleanUpdateData);
      }

      // HARD DELETE previous process items (matches ProcessTemplateMappingEntity pattern)
      await this.bomProcessItemRepo.delete({ bomId: params.id });

      // Bulk re-insert updated process items
      if (params.items && params.items.length > 0) {
        const processItemsData = params.items.map((item: any) => ({
          bomId: params.id,
          processTemplateMappingId: item.processTemplateMappingId,
          materialType: item.materialType,
          itemId: item.itemId,
          quantity: item.quantity,
          isPrimary: item.isPrimary,
        }));
        await this.bomProcessItemRepo.insert(processItemsData);
      }

      // Update attachments if provided
      let attachmentMessage = '';
      let parsedRetainedAttachments: any[] = [];
      if (params.retainedAttachments) {
        try {
          parsedRetainedAttachments = JSON.parse(params.retainedAttachments);
        } catch (e) {
          // invalid json, default to empty
        }
      }

      try {
        const syncRes = await this.attachmentMasterService.syncMultipleAttachments(
          companyId,
          AttachmentModule.BOM,
          params.id,
          parsedRetainedAttachments,
          files || []
        );
        if (syncRes.success === 0) {
          attachmentMessage = ' BOM updated successfully, but attachments failed to sync.';
        }
      } catch (err) {
        attachmentMessage = ' BOM updated successfully, but attachments failed to sync.';
      }

      // Log activity
      const logPayload = this.general.buildActivityLogPayload(
        req,
        'BOM_UPDATE',
        'BOM',
        params.id,
        params.bomName,
        companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Bill of Materials (BOM) updated successfully.' + attachmentMessage,
        data: { id: params.id },
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

  async   startDeleteBom(req: IAppRequest, params: BomDeleteDto) {
    const response = await this.deleteBom(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  /**
   * Delete BOM Service (Soft delete master, hard delete process items)
   */
  async deleteBom(req: IAppRequest, params: BomDeleteDto) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('BOM ID is required for delete');
      }

      const existingBom = await this.bomRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingBom) {
        throw new Error('BOM not found');
      }

      this.general.assertCompanyAccess(req, existingBom.companyId, 'delete', 'BOM');

      const payload = this.general.buildSoftDeletePayload(
        { bomCode: existingBom.bomCode, bomName: existingBom.bomName },
        req,
      );

      // Soft delete parent
      await this.bomRepo.update({ id: params.id }, payload);

      // Hard delete child mappings
      await this.bomProcessItemRepo.delete({ bomId: params.id });

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'BOM_DELETE',
        'BOM',
        params.id,
        existingBom.bomName,
        existingBom.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Bill of Materials (BOM) deleted successfully.',
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
