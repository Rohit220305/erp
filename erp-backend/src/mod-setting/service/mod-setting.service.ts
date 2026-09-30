import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Status } from 'src/package/common/enums/enum';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';

import { ModSettingEntity } from '../entity/mod-setting.entity';
import { ModSettingCacheService } from './mod-setting.cache.service';
import {
  ModSettingAddDto,
  ModSettingUpdateDto,
  ModSettingDeleteDto,
} from '../dto/mod-setting.dto';

@Injectable()
export class ModSettingService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly activityLogService: ActivityLogService,
    private readonly cacheService: ModSettingCacheService,
  ) {}

  @InjectRepository(ModSettingEntity)
  private readonly repo: Repository<ModSettingEntity>;

  async startInsertModSetting(req: IAppRequest, params: ModSettingAddDto) {
    const response = await this.insertModSetting(req, params);
    if (response.success == 1) {
      await this.cacheService.refreshCache();
      return await this.finishSuccess(response, params);
    }
    return await this.finishFailure(response);
  }

  async insertModSetting(req: IAppRequest, params: ModSettingAddDto) {
    let return_data: any = {};
    try {
      const codeExists = await this.repo.findOne({
        where: { code: params.code, sysRecDeleted: false },
      });

      if (codeExists) throw new Error(`Code '${params.code}' already exists.`);

      const dbInsertData: any = { ...params };
      Object.keys(dbInsertData).forEach((key) => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.repo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

    //   const logPayload = this.general.buildActivityLogPayload(
    //     req,
    //     'MOD_SETTING_CREATE',
    //     'MOD_SETTING',
    //     insertId,
    //     params.name,
    //     req.user?.companyId || 0,
    //   );
    //   await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Setting Added Successfully',
        data: { insert_id: insertId },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startUpdateModSetting(req: IAppRequest, params: ModSettingUpdateDto) {
    const response = await this.updateModSetting(req, params);
    if (response.success == 1) {
      await this.cacheService.refreshCache();
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async updateModSetting(req: IAppRequest, params: ModSettingUpdateDto) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('Setting ID is required');

      const existing = await this.repo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });
      if (!existing) throw new Error('Setting not found');

      if (params.code && params.code !== existing.code) {
        const codeExists = await this.repo.findOne({
          where: { code: params.code, sysRecDeleted: false },
        });
        if (codeExists)
          throw new Error(`Code '${params.code}' already exists.`);
      }

      const { id: _extractedId, ...dbUpdateData } = params as any;
      Object.keys(dbUpdateData).forEach((key) => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.repo.update({ id: params.id }, dbUpdateData);

    //   const logPayload = this.general.buildActivityLogPayload(
    //     req,
    //     'MOD_SETTING_UPDATE',
    //     'MOD_SETTING',
    //     params.id,
    //     params.name || existing.name,
    //     req.user?.companyId || 0,
    //   );
    //   await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Setting Updated Successfully',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startDeleteModSetting(req: IAppRequest, params: ModSettingDeleteDto) {
    const response = await this.deleteModSetting(req, params);
    if (response.success == 1) {
      await this.cacheService.refreshCache();
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async deleteModSetting(req: IAppRequest, params: ModSettingDeleteDto) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('Setting ID is required');

      const existing = await this.repo.findOne({
        where: { id: params.id, sysRecDeleted: false },
      });
      if (!existing) throw new Error('Setting not found');

      const payload = this.general.buildSoftDeletePayload(
        { name: existing.name, code: existing.code },
        req,
      );
      const res = await this.repo.update({ id: params.id }, payload);

    //   const logPayload = this.general.buildActivityLogPayload(
    //     req,
    //     'MOD_SETTING_DELETE',
    //     'MOD_SETTING',
    //     params.id,
    //     existing.name,
    //     req.user?.companyId || 0,
    //   );
    //   await this.activityLogService.log(logPayload);

      return_data = {
        success: 1,
        message: 'Setting Deleted Successfully',
        data: { affected: res.affected },
      };
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async finishSuccess(params, incomingData?) {
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data || [],
      },
    };
  }

  async finishFailure(params, incomingData?) {
    return {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'Something went wrong',
        data: params?.data || [],
      },
    };
  }
}
