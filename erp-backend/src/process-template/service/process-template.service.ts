import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessTemplateEntity } from '../entity/process-template.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class ProcessTemplateService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
  ) { }

  @InjectRepository(ProcessTemplateEntity)
  private processTemplateRepo: Repository<ProcessTemplateEntity>;

  async startInsertProcessTemplate(req, params) {
    const response = await this.insertProcessTemplate(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response, params);
    }

    return await this.finishFailure(response);
  }

  async insertProcessTemplate(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.templateCode) {
        const codeExists = await this.processTemplateRepo.findOne({
          where: {
            templateCode: params.templateCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Template Code already exists');
        }
      }

      if (params.templateName) {
        const nameExists = await this.processTemplateRepo.findOne({
          where: {
            templateName: params.templateName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Template Name already exists');
        }
      }

      const {
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.processTemplateRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_TEMPLATE_CREATE',
        'PROCESS_TEMPLATE',
        res?.raw?.insertId,
        params.templateName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Template Added Successfully.',
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

  async startUpdateProcessTemplate(req, params) {
    const response = await this.updateProcessTemplate(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updateProcessTemplate(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Template ID is required');
      }

      const template = await this.processTemplateRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!template) {
        throw new Error('Process Template not found');
      }

      this.general.assertCompanyAccess(req, template.companyId, 'update', 'template');

      if (params.templateCode && params.templateCode !== template.templateCode) {
        const codeExists = await this.processTemplateRepo.findOne({
          where: {
            templateCode: params.templateCode,
            companyId: template.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Template Code already exists');
        }
      }

      if (params.templateName && params.templateName !== template.templateName) {
        const nameExists = await this.processTemplateRepo.findOne({
          where: {
            templateName: params.templateName,
            companyId: template.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Template Name already exists');
        }
      }

      const {
        id: _extractedId,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.processTemplateRepo.update(
        { id: params.id },
        dbUpdateData,
      );

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_TEMPLATE_UPDATE',
        'PROCESS_TEMPLATE',
        params.id,
        params.templateName || template.templateName,
        template.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Template Updated Successfully.',
        data: {
          affected: res.affected,
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

  async startDeleteProcessTemplate(req, params) {
    const response = await this.deleteProcessTemplate(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteProcessTemplate(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Template ID is required');
      }

      const template = await this.processTemplateRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!template) {
        throw new Error('Process Template not found');
      }

      this.general.assertCompanyAccess(req, template.companyId, 'delete', 'template');

      const payload = this.general.buildSoftDeletePayload(
        { templateCode: template.templateCode, templateName: template.templateName },
        req,
      );
      const res = await this.processTemplateRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_TEMPLATE_DELETE',
        'PROCESS_TEMPLATE',
        params.id,
        template.templateName,
        template.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Template Deleted Successfully.',
        data: {
          affected: res.affected,
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

  async finishSuccess(params, incomingData?) {
    let output: any = {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data ? params.data : [],
      },
    };

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

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

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
