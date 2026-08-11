import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StorageEntity } from '../entity/storage.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @InjectRepository(StorageEntity)
  private storageRepo: Repository<StorageEntity>;

  async startInsertStorage(req, params) {
    const response = await this.insertStorage(req, params);

    if (response.success == 1) {
      const insertId = response?.data?.insert_id;

      if (params.storageImage && insertId) {
        const fileResponse = await this.commonFileService.transferFile(
          params.storageImage,
          insertId,
          'storage',
        );

        if (fileResponse.success == 0) {
          await this.storageRepo.delete({
            id: insertId,
          });

          return await this.finishFailure({
            success: 0,
            message:
              'Storage created but file transfer failed. Transaction rolled back.',
          });
        }
      }

      return await this.finishSuccess(response, params);
    }

    if (params.storageImage) {
      await this.commonFileService.deleteTempFile(params.storageImage);
    }

    return await this.finishFailure(response);
  }

  async insertStorage(req, params) {
    let return_data: any = {};

    try {

     
      if (!this.general.isSuperAdmin(req)) {
        params.companyId = req.user.companyId;
      } else if (!params.companyId) {
        throw new Error('companyId is required');
      }
      if (params.storageCode) {
        const codeExists = await this.storageRepo.findOne({
          where: {
            storageCode: params.storageCode,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });
        
        if (codeExists) {
          throw new Error('Storage Code already exists');
        }
      }
      if (params.storageName) {
        const nameExists = await this.storageRepo.findOne({
          where: {
            storageName: params.storageName,
            companyId: params.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Storage Name already exists');
        }
      }
      const {
        storageImage: _extractedStorageImage,
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.storageRepo.insert(dbInsertData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'STORAGE_CREATE',
        'STORAGE',
        res?.raw?.insertId,
        params.storageName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Storage Added Successfully.',
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

  async startUpdateStorage(req, params) {
    const response = await this.updateStorage(req, params);

    if (response.success == 1) {
      if (params.storageImage && params.id) {
        const fileResponse = await this.commonFileService.transferFile(
          params.storageImage,
          params.id,
          'storage',
        );

        if (fileResponse.success == 0) {
          return await this.finishFailure({
            success: 0,
            message: 'Storage updated but image upload failed.',
          });
        }
      }

      return await this.finishSuccess(response);
    }

    if (params.storageImage) {
      await this.commonFileService.deleteTempFile(params.storageImage);
    }

    return await this.finishFailure(response);
  }

  async updateStorage(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Storage ID is required');
      }

      const storage = await this.storageRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!storage) {
        throw new Error('Storage not found');
      }

      this.general.assertCompanyAccess(req, storage.companyId, 'update', 'storage');

      if (params.storageCode && params.storageCode !== storage.storageCode) {
        const codeExists = await this.storageRepo.findOne({
          where: {
            storageCode: params.storageCode,
            companyId: storage.companyId,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Storage Code already exists');
        }
      }

      if (params.storageName && params.storageName !== storage.storageName) {
        const nameExists = await this.storageRepo.findOne({
          where: {
            storageName: params.storageName,
            companyId: storage.companyId,
            sysRecDeleted: false,
          },
        });

        if (nameExists) {
          throw new Error('Storage Name already exists');
        }
      }

      const {
        id: _extractedId,
        storageImage: _extractedStorageImage,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.storageRepo.update({ id: params.id }, dbUpdateData);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'STORAGE_UPDATE',
        'STORAGE',
        params.id,
        params.storageName || storage.storageName,
        storage.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Storage Updated Successfully.',
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

  async startDeleteStorage(req, params) {
    const response = await this.deleteStorage(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    } else {
      return await this.finishFailure(response);
    }
  }

  async deleteStorage(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Storage ID is required');
      }

      const storage = await this.storageRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!storage) {
        throw new Error('Storage not found');
      }

      this.general.assertCompanyAccess(req, storage.companyId, 'delete', 'storage');

      const payload = this.general.buildSoftDeletePayload(
        { storageCode: storage.storageCode, storageName: storage.storageName },
        req,
      );
      const res = await this.storageRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'STORAGE_DELETE',
        'STORAGE',
        params.id,
        storage.storageName,
        storage.companyId,
      );
      await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Storage Deleted Successfully.',
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
