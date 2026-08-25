import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessTemplateEntity } from '../entity/process.template.entity';
import { ProcessTemplateMappingEntity } from '../entity/process.template.mapping.entity';
import { ProcessEntity } from '../../process/entity/process.entity';
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

  @InjectRepository(ProcessTemplateMappingEntity)
  private processTemplateMappingRepo: Repository<ProcessTemplateMappingEntity>;

  @InjectRepository(ProcessEntity)
  private processRepo: Repository<ProcessEntity>;

  private async validateProcesses(processes: any[], companyId: number) {
    if (!processes || !Array.isArray(processes) || processes.length === 0) {
      return;
    }

    const processIds = processes.map((p) => Number(p.processId));

    const uniqueIds = new Set(processIds);
    if (uniqueIds.size !== processIds.length) {
      throw new Error('Duplicate process found in template sequence');
    }

    const sortedSeqs = processes.map((p) => Number(p.sequenceNo)).sort((a, b) => a - b);
    for (let i = 0; i < sortedSeqs.length; i++) {
      if (sortedSeqs[i] !== i + 1) {
        throw new Error('Process sequence numbers must be contiguous starting from 1');
      }
    }

    const processSeqMap = new Map<number, number>();
    processes.forEach((p) => {
      processSeqMap.set(Number(p.processId), Number(p.sequenceNo));
    });

    for (const proc of processes) {
      const currentId = Number(proc.processId);
      const currentSeq = Number(proc.sequenceNo);
      const deps = proc.dependencies;

      if (deps && Array.isArray(deps) && deps.length > 0) {
        for (const depIdRaw of deps) {
          const depId = Number(depIdRaw);
          if (depId === currentId) {
            throw new Error(`Process ID ${currentId} cannot depend on itself`);
          }

          if (!processSeqMap.has(depId)) {
            throw new Error(`Dependency process ID ${depId} is not part of this template sequence`);
          }

          const depSeq = processSeqMap.get(depId)!;
          if (depSeq >= currentSeq) {
            throw new Error(
              `Process ID ${currentId} (sequence ${currentSeq}) cannot depend on process ID ${depId} (sequence ${depSeq}). Dependencies must reference processes positioned above in the sequence.`
            );
          }
        }
      }
    }

    const dbProcesses = await this.processRepo.createQueryBuilder('p')
      .where('p.id IN (:...ids)', { ids: Array.from(uniqueIds) })
      .andWhere('p.sysRecDeleted = 0')
      .getMany();

    if (dbProcesses.length !== uniqueIds.size) {
      throw new Error('One or more selected processes are invalid or deleted');
    }

    for (const dbProc of dbProcesses) {
      if (dbProc.companyId !== companyId) {
        throw new Error(`Process ID ${dbProc.id} does not belong to company ID ${companyId}`);
      }
    }
  }

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

      if (params.processes && Array.isArray(params.processes)) {
        await this.validateProcesses(params.processes, params.companyId);
      }

      const {
        processes,
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = new Date();

      const res = await this.processTemplateRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      if (insertId && processes && Array.isArray(processes) && processes.length > 0) {
        const mappingInserts = processes.map((proc: any) => ({
          templateId: insertId,
          processId: Number(proc.processId),
          sequenceNo: Number(proc.sequenceNo),
          dependencies: proc.dependencies && proc.dependencies.length > 0 ? proc.dependencies : null,
          nodePosition: proc.nodePosition || null,
          handleConfig: proc.handleConfig || null,
          addedBy: req.user?.sub,
          addedDate: new Date(),
        }));
        await this.processTemplateMappingRepo.insert(mappingInserts);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_TEMPLATE_CREATE',
        'PROCESS_TEMPLATE',
        insertId,
        params.templateName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Template Added Successfully.',
        data: {
          insert_id: insertId,
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

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
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

      if (params.processes && Array.isArray(params.processes)) {
        await this.validateProcesses(params.processes, template.companyId);
      }

      const {
        id: _extractedId,
        processes,
        ...dbUpdateData
      } = params as any;

      const allowedUpdateKeys = ['templateName', 'templateCode', 'executionType', 'remark', 'status', 'companyId'];
      const cleanUpdateData: any = {};
      allowedUpdateKeys.forEach((key) => {
        if (dbUpdateData[key] !== undefined && dbUpdateData[key] !== null) {
          cleanUpdateData[key] = dbUpdateData[key];
        }
      });
      cleanUpdateData.updatedBy = req.user?.sub;
      cleanUpdateData.updatedDate = new Date();

      if (Object.keys(cleanUpdateData).length > 2) {
        await this.processTemplateRepo.update({ id: params.id }, cleanUpdateData);
      }

      await this.processTemplateMappingRepo.delete({ templateId: params.id });

      if (processes && Array.isArray(processes) && processes.length > 0) {
        const mappingInserts = processes.map((proc: any) => {
          const item: any = {
            templateId: params.id,
            processId: Number(proc.processId),
            sequenceNo: Number(proc.sequenceNo),
            dependencies: proc.dependencies && proc.dependencies.length > 0 ? proc.dependencies : null,
            addedBy: req.user?.sub,
            addedDate: new Date(),
          };
          if (proc.nodePosition) item.nodePosition = proc.nodePosition;
          if (proc.handleConfig) item.handleConfig = proc.handleConfig;
          return item;
        });

        try {
          await this.processTemplateMappingRepo.insert(mappingInserts);
        } catch (dbErr) {
          const fallbackInserts = mappingInserts.map(({ nodePosition, handleConfig, ...rest }) => rest);
          await this.processTemplateMappingRepo.insert(fallbackInserts);
        }
      }

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
          id: params.id,
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

      const mappingPayload = this.general.buildSoftDeletePayload({}, req);
      await this.processTemplateMappingRepo.update(
        { templateId: params.id, sysRecDeleted: false },
        mappingPayload,
      );

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

