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
import { BomAddDto, BomUpdateDto, BomDeleteDto, BomProcessItemDto, BomCloneDto} from '../dto/bom.dto';
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

  private async validateCrossTenant(
    companyId: number,
    itemId: number,
    processTemplateId: number,
    customerId?: number | null,
    items?: BomProcessItemDto[],
  ): Promise<void> {
    const mainItem = await this.itemRepo.findOne({
      where: { id: itemId, companyId, sysRecDeleted: false },
    });
    if (!mainItem) {
      throw new Error(`Primary Item (ID: ${itemId}) does not exist or does not belong to your company.`);
    }

    const template = await this.processTemplateRepo.findOne({
      where: { id: processTemplateId, companyId, sysRecDeleted: false },
    });
    if (!template) {
      throw new Error(`Process Template (ID: ${processTemplateId}) does not exist or does not belong to your company.`);
    }

    if (customerId) {
      const customer = await this.itemRepo.query(
        `SELECT id FROM party_master WHERE id = ? AND companyId = ? AND sysRecDeleted = 0 LIMIT 1`,
        [customerId, companyId],
      ).catch(() => null);
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

  public async validateInternalTransfers(
    processTemplateId: number,
    items: BomProcessItemDto[],
  ): Promise<void> {
    if (!items || items.length === 0) return;

    const mappings = await this.processTemplateMappingRepo.find({
      where: { templateId: processTemplateId },
      order: { sequenceNo: 'ASC' },
    });

    if (mappings.length === 0) {
      throw new Error(`Process template (ID: ${processTemplateId}) has no process mapping steps configured.`);
    }

    const mappingSeqMap = new Map<number, number>();
    mappings.forEach((m) => mappingSeqMap.set(m.id, m.sequenceNo));

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

      for (const item of stepItems) {
        if (item.materialType === MaterialType.Exit) {
          producedExitItemsSet.add(item.itemId);
        }
      }
    }
  }

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

  async insertBom(req: IAppRequest, params: BomAddDto, files?: any[]) {
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
        params.itemId,
        params.processTemplateId,
        params.customerId,
        params.items,
      );

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

      let attachmentMessage = '';
      if (files && files.length > 0) {
        try {
          const syncRes = await this.attachmentMasterService.syncMultipleAttachments(
            params.companyId,
            AttachmentModule.BOM,
            insertId,
            [],
            files
          );
          if (syncRes.success === 0) {
            attachmentMessage = ' BOM created successfully, but attachments failed to save.';
          }
        } catch (err) {
          attachmentMessage = ' BOM created successfully, but attachments failed to save.';
        }
      }

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

  async updateBom(req: IAppRequest, params: BomUpdateDto, files?: any[]) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('BOM ID is required for update');
      }

      const orderCount = await this.bomRepo.query(
        `SELECT COUNT(1) as count FROM production_order WHERE bomId = ? AND sysRecDeleted = 0 AND status != 'Cancelled'`,
        [params.id]
      );
      if (orderCount[0].count > 0) {
        throw new Error('Cannot update this BOM because it is already linked to one or more Production Orders.');
      }

      const existingBom = await this.bomRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!existingBom) {
        throw new Error('BOM not found');
      }

      this.general.assertCompanyAccess(req, existingBom.companyId, 'update', 'BOM');

      const companyId = existingBom.companyId;

      await this.validateCrossTenant(
        companyId,
        params.itemId || existingBom.itemId,
        params.processTemplateId || existingBom.processTemplateId,
        params.customerId !== undefined ? params.customerId : existingBom.customerId,
        params.items,
      );

      await this.validateInternalTransfers(
        params.processTemplateId || existingBom.processTemplateId,
        params.items,
      );

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

      await this.bomProcessItemRepo.delete({ bomId: params.id });

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

      let attachmentMessage = '';
      let parsedRetainedAttachments: any[] = [];
      if (params.retainedAttachments) {
        try {
          parsedRetainedAttachments = JSON.parse(params.retainedAttachments);
        } catch (e) {
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

      await this.bomRepo.update({ id: params.id }, payload);

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

  async startCLoneBom(req: IAppRequest, params: BomCloneDto) { 
    const response = await this.cloneBom(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async cloneBom(req: IAppRequest, params: BomCloneDto) {
    let return_data: any = {};
    console.log('Cloning BOM with params:', params);                                                                                    

    try {
      const companyId = req.user?.companyId;
      if (!companyId) {
        throw new Error('Company ID is required for cloning BOM');
      }

      const sourceBom = await this.bomRepo.findOne({
        where: { id: params.sourceBomId, sysRecDeleted: false },
      });
      if (!sourceBom) {
        throw new Error('Source BOM not found');
      }

      const targetCompanyId = companyId;

      this.general.assertCompanyAccess(
        req,
        sourceBom.companyId,
        'clone',
        'BOM',
      );

      const newBomCode = await this.generateUniqueBomCode(targetCompanyId);

      const newBom = this.bomRepo.create({
        bomName: params.newBomName.trim(),
        bomCode: newBomCode,
        productionMethod: sourceBom.productionMethod,
        itemId: sourceBom.itemId,
        processTemplateId: sourceBom.processTemplateId,
        customerId: sourceBom.customerId,
        referenceNumber: sourceBom.referenceNumber,
        remarks: sourceBom.remarks,
        companyId: targetCompanyId,
        status: Status.Active,
        addedBy: req.user?.sub || null,
        addedDate: new Date(),
      });
      const res = await this.bomRepo.save(newBom);
      const insertId = res?.id;
      if (!insertId) {
        throw new Error('Failed to create cloned BOM record');
      }

      const sourceItems = await this.bomProcessItemRepo.find({
        where: { bomId: params.sourceBomId },
      });

      if (sourceItems.length > 0) {
        const clonedItems = sourceItems.map((item) => ({
          bomId: insertId,
          processTemplateMappingId: item.processTemplateMappingId,
          materialType: item.materialType,
          itemId: item.itemId,
          quantity: item.quantity,
          isPrimary: item.isPrimary,
        }));
        await this.bomProcessItemRepo.insert(clonedItems);
      }

      try {
        const activityPayload = this.general.buildActivityLogPayload(
          req,
          'BOM',
          'CLONE_BOM',
          insertId,
          `Cloned BOM '${sourceBom.bomName}' (${sourceBom.bomCode}) to '${params.newBomName}' (${newBomCode})`,
          targetCompanyId,
        );
        await this.activityLogService.log(activityPayload);
      } catch (logErr) {
        console.error('Failed to log BOM clone activity:', logErr);
      }
      return_data = {
        success: 1,
        message: 'BOM cloned successfully',
        data: {
          id: insertId,
          bomName: params.newBomName,
          bomCode: newBomCode,
        },
      };
    } catch (error: any) {
      return_data = {
        success: 0,
        message: error.message || 'Error occurred while cloning BOM',
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
