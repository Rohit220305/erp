import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkCentreEntity } from '../entity/work-centre.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class WorkCentreService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(WorkCentreEntity)
  private workCentreRepo: Repository<WorkCentreEntity>;

  async startInsertWorkCentre(req, params) {
    const response = await this.insertWorkCentre(req, params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

      if (params.imageUrl && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.imageUrl,
          insertId,
          'work_centre',
        );

        if (fileResponse.success == 0) {
          await this.workCentreRepo.delete({ id: insertId });
          return await this.finishFailure({
            success: 0,
            message: 'Work Centre created but image transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.imageUrl) {
      await this.commonFileService.deleteTempFile(params.imageUrl);
    }

    return await this.finishFailure(response);
  }

  async insertWorkCentre(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.workCentreCode) {
        const codeExists = await this.workCentreRepo.findOne({
          where: {
            workCentreCode: params.workCentreCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        
        if (codeExists) {
          throw new Error('Work Centre Code already exists');
        }
      }

      if (params.workCentreName) {
        const nameExists = await this.workCentreRepo.findOne({
          where: {
            workCentreName: params.workCentreName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Work Centre Name already exists');
        }
      }

      const { ...dbInsertData } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null || dbInsertData[key] === 'null' || dbInsertData[key] === 'undefined') {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.workCentreRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'WORK_CENTRE_CREATE',
        'WORK_CENTRE',
        res?.raw?.insertId,
        params.workCentreName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Work Centre Added Successfully.',
        data: {
          insert_id: res?.raw?.insertId,
        },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startUpdateWorkCentre(req, params) {
    const response = await this.updateWorkCentre(req, params);

    if (response.success == 1) {
      if (params.imageUrl && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.imageUrl,
          params.id,
          'work_centre',
        );

        if (fileResponse.success == 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Work Centre updated but image upload failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.imageUrl) {
      await this.commonFileService.deleteTempFile(params.imageUrl);
    }

    return await this.finishFailure(response);
  }

  async updateWorkCentre(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Work Centre ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const workCentre = await this.workCentreRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!workCentre) {
        throw new Error('Work Centre not found');
      }

      this.general.assertCompanyAccess(req, workCentre.companyId, 'update', 'work_centre');

      if (params.workCentreCode && params.workCentreCode !== workCentre.workCentreCode) {
        const codeExists = await this.workCentreRepo.findOne({
          where: { workCentreCode: params.workCentreCode, companyId: workCentre.companyId, sysRecDeleted: false },
        });
        if (codeExists) throw new Error('Work Centre Code already exists');
      }

      if (params.workCentreName && params.workCentreName !== workCentre.workCentreName) {
        const nameExists = await this.workCentreRepo.findOne({
          where: { workCentreName: params.workCentreName, companyId: workCentre.companyId, sysRecDeleted: false },
        });
        if (nameExists) throw new Error('Work Centre Name already exists');
      }

      const { id: _extractedId, ...dbUpdateData } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null || dbUpdateData[key] === 'null' || dbUpdateData[key] === 'undefined') {
          delete dbUpdateData[key];
        }
      });
      
      if (params.imageUrl === "") {
         dbUpdateData.imageUrl = null;
      }

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.workCentreRepo.update({ id: params.id }, dbUpdateData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'WORK_CENTRE_UPDATE',
        'WORK_CENTRE',
        params.id,
        params.workCentreName || workCentre.workCentreName,
        workCentre.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Work Centre Updated Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startDeleteWorkCentre(req, params) {
    const response = await this.deleteWorkCentre(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteWorkCentre(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Work Centre ID is required');
      }

      const workCentre = await this.workCentreRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!workCentre) {
        throw new Error('Work Centre not found');
      }

      this.general.assertCompanyAccess(req, workCentre.companyId, 'delete', 'work_centre');

      const payload = this.general.buildSoftDeletePayload(
        { workCentreCode: workCentre.workCentreCode, workCentreName: workCentre.workCentreName },
        req,
      );
      const res = await this.workCentreRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'WORK_CENTRE_DELETE',
        'WORK_CENTRE',
        params.id,
        workCentre.workCentreName,
        workCentre.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Work Centre Deleted Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async finishSuccess(params, incomingData?) {
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
