import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProcessEntity } from '../entity/process.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class ProcessService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(ProcessEntity)
  private processRepo: Repository<ProcessEntity>;

  async startInsertProcess(req, params) {
    const response = await this.insertProcess(req, params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

      if (insertId) {
        let hasError = false;

        if (params.imageUrl) {
          const fileResponse = await this.commonFileService.transferFile(
            params.imageUrl,
            insertId,
            'process_master',
          );
          if (fileResponse.success == 0) hasError = true;
        }

        if (params.instructionPdfUrl && !hasError) {
          const pdfResponse = await this.commonFileService.transferFile(
            params.instructionPdfUrl,
            insertId,
            'process_master_pdf',
          );
          if (pdfResponse.success == 0) hasError = true;
        }

        if (hasError) {
          await this.processRepo.delete({ id: insertId });
          return await this.finishFailure({
            success: 0,
            message: 'Process created but file transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.imageUrl) {
      await this.commonFileService.deleteTempFile(params.imageUrl);
    }
    if (params.instructionPdfUrl) {
      await this.commonFileService.deleteTempFile(params.instructionPdfUrl);
    }

    return await this.finishFailure(response);
  }

  async insertProcess(req, params) {
    let return_data: any = {};

    try {
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }

      if (params.processCode) {
        const codeExists = await this.processRepo.findOne({
          where: {
            processCode: params.processCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        
        if (codeExists) {
          throw new Error('Process Code already exists');
        }
      }

      if (params.processName) {
        const nameExists = await this.processRepo.findOne({
          where: {
            processName: params.processName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Process Name already exists');
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

      const res = await this.processRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_MASTER_CREATE',
        'PROCESS_MASTER',
        res?.raw?.insertId,
        params.processName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Added Successfully.',
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

  async startUpdateProcess(req, params) {
    const response = await this.updateProcess(req, params);

    if (response.success == 1) {
      let hasError = false;

      if (params.imageUrl && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.imageUrl,
          params.id,
          'process_master',
        );
        if (fileResponse.success == 0) hasError = true;
      }

      if (params.instructionPdfUrl && params.id && !hasError) {
        const pdfResponse = await this.commonFileService.transferFile(
          params.instructionPdfUrl,
          params.id,
          'process_master_pdf',
        );
        if (pdfResponse.success == 0) hasError = true;
      }

      if (hasError) {
        return await this.finishFailure({
          success: 0,
          message: 'Process updated but file upload failed.',
        });
      }

      return await this.finishSuccess(response);
    }

    if (params.imageUrl) {
      await this.commonFileService.deleteTempFile(params.imageUrl);
    }
    if (params.instructionPdfUrl) {
      await this.commonFileService.deleteTempFile(params.instructionPdfUrl);
    }

    return await this.finishFailure(response);
  }

  async updateProcess(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Process ID is required');
      }

      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      }

      const processData = await this.processRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!processData) {
        throw new Error('Process not found');
      }

      this.general.assertCompanyAccess(req, processData.companyId, 'update', 'process_master');

      if (params.processCode && params.processCode !== processData.processCode) {
        const codeExists = await this.processRepo.findOne({
          where: { processCode: params.processCode, companyId: processData.companyId, sysRecDeleted: false },
        });
        if (codeExists) throw new Error('Process Code already exists');
      }

      if (params.processName && params.processName !== processData.processName) {
        const nameExists = await this.processRepo.findOne({
          where: { processName: params.processName, companyId: processData.companyId, sysRecDeleted: false },
        });
        if (nameExists) throw new Error('Process Name already exists');
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
      
      if (params.instructionPdfUrl === "") {
         dbUpdateData.instructionPdfUrl = null;
      }

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = new Date();

      const res = await this.processRepo.update({ id: params.id }, dbUpdateData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_MASTER_UPDATE',
        'PROCESS_MASTER',
        params.id,
        params.processName || processData.processName,
        processData.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Updated Successfully.',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }

    return return_data;
  }

  async startDeleteProcess(req, params) {
    const response = await this.deleteProcess(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteProcess(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Process ID is required');
      }

      const processData = await this.processRepo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });

      if (!processData) {
        throw new Error('Process not found');
      }

      this.general.assertCompanyAccess(req, processData.companyId, 'delete', 'process_master');

      const payload = this.general.buildSoftDeletePayload(
        { processCode: processData.processCode, processName: processData.processName },
        req,
      );
      const res = await this.processRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'PROCESS_MASTER_DELETE',
        'PROCESS_MASTER',
        params.id,
        processData.processName,
        processData.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Process Deleted Successfully.',
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
