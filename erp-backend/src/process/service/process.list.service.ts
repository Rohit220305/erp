import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessEntity } from '../entity/process.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { AttachmentMasterService } from 'src/attachment-master/service/attachment-master.service';
import { AttachmentModule } from 'src/attachment-master/enums/attachment-module.enum';

@Injectable()
export class ProcessListService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly attachmentMasterService: AttachmentMasterService,
  ) {}

  @InjectRepository(ProcessEntity)
  private processRepo: Repository<ProcessEntity>;

  async startProcessDetails(req, params) {
    const response = await this.getProcessDetails(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getProcessDetails(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Process ID is required');
      }

      const queryBuilder = this.processRepo.createQueryBuilder('process_master');

      queryBuilder.select([
        'process_master.id AS id',
        'process_master.processCode AS processCode',
        'process_master.processName AS processName',
        'process_master.imageUrl AS imageUrl',
        'process_master.description AS description',
        'process_master.status AS status',
        'process_master.companyId AS companyId',
        'process_master.workCentreId AS workCentreId',
        'process_master.addedDate AS addedDate',
        'process_master.updatedDate AS updatedDate',
        'process_master.addedBy AS addedBy',
        'process_master.updatedBy AS updatedBy',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = process_master.companyId');

      queryBuilder.addSelect('work_centre.workCentreName', 'workCentreName');
      queryBuilder.leftJoin('work_centre_master', 'work_centre', 'work_centre.id = process_master.workCentreId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = process_master.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = process_master.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('process_master.id = :id', { id: params.id });
      queryBuilder.andWhere('process_master.sysRecDeleted = 0');

      const processData = await queryBuilder.getRawOne();

      if (!processData) {
        throw new Error('Process not found');
      }

      this.general.assertCompanyAccess(req, processData.companyId, 'view', 'process_master');

      processData.addedDateFormatted = await this.general.dateFormat(processData.addedDate);
      if (processData.updatedDate) {
        processData.updatedDateFormatted = await this.general.dateFormat(processData.updatedDate);
      }

      if (processData.imageUrl) {
        processData.imageUrl = await this.general.generateUrl(
          'process_master',
          `${processData.id}`,
          processData.imageUrl,
        );
      }

      const attachmentDetails = await this.attachmentMasterService.getAttachmentByEntity(
        processData.companyId,
        AttachmentModule.PROCESS,
        processData.id,
      );
      processData.instructionPdfUrl = attachmentDetails ? attachmentDetails.url : null;
      processData.attachmentDetails = attachmentDetails || null;

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: processData,
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startProcessList(req, params) {
    const response = await this.getProcessList(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async getProcessList(req, params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.processRepo.createQueryBuilder('process_master');

      queryBuilder.select([
        'process_master.id AS id',
        'process_master.processCode AS processCode',
        'process_master.processName AS processName',
        'process_master.imageUrl AS imageUrl',
        'process_master.description AS description',
        'process_master.status AS status',
        'process_master.companyId AS companyId',
        'process_master.workCentreId AS workCentreId',
        'process_master.addedDate AS addedDate',
        'process_master.updatedDate AS updatedDate',
      ]);

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.leftJoin('company', 'company', 'company.id = process_master.companyId');

      queryBuilder.addSelect('work_centre.workCentreName', 'workCentreName');
      queryBuilder.leftJoin('work_centre_master', 'work_centre', 'work_centre.id = process_master.workCentreId');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = process_master.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = process_master.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('process_master.sysRecDeleted = 0');

      this.general.applyCompanyScope(queryBuilder, req, 'process_master');

      await this.general.applyListQuery(queryBuilder, params, 'process_master.processName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      for (const item of data) {
        if (item.imageUrl) {
          item.imageUrl = await this.general.generateUrl(
            'process_master',
            `${item.id}`,
            item.imageUrl,
          );
        }
        const attachment = await this.attachmentMasterService.getAttachmentByEntity(
          item.companyId,
          AttachmentModule.PROCESS,
          item.id,
        );
        item.instructionPdfUrl = attachment ? attachment.url : null;
        item.attachmentDetails = attachment || null;
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Process List fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err) {
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params) {
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params?.data : [],
      },
    };
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
