import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ModSettingEntity } from '../entity/mod-setting.entity';
import {
  ModSettingListDto,
  ModSettingDetailsDto,
} from '../dto/mod-setting.dto';

@Injectable()
export class ModSettingListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(ModSettingEntity)
  private readonly repo: Repository<ModSettingEntity>;

  async startModSettingList(req: IAppRequest, params: ModSettingListDto) {
    const response = await this.getModSettingList(req, params);
    if (response.success == 1) return await this.finishSuccess(response);
    return await this.finishFailure(response);
  }

  async getModSettingList(req: IAppRequest, params: ModSettingListDto) {
    let return_data: any = {};
    try {
      const { page, limit, skip } = this.general.parsePagination(params);
      const queryBuilder = this.repo.createQueryBuilder('setting');

      queryBuilder.select([
        'setting.id AS id',
        'setting.name AS name',
        'setting.code AS code',
        'setting.value AS value',
        'setting.status AS status',
        'setting.addedDate AS addedDate',
        'setting.updatedDate AS updatedDate',
      ]);

      queryBuilder.leftJoin(
        'users',
        'addedByUser',
        'addedByUser.id = setting.addedBy',
      );
      queryBuilder.leftJoin(
        'users',
        'updatedByUser',
        'updatedByUser.id = setting.updatedBy',
      );

      queryBuilder.addSelect(
        "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        'addedByName',
      );
      queryBuilder.addSelect(
        "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
        'updatedByName',
      );

      queryBuilder.andWhere('setting.sysRecDeleted = 0');

      await this.general.applyListQuery(queryBuilder, params, 'setting.name');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);

      const data = await queryBuilder.getRawMany();
      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(
        total,
        page,
        limit,
        skip,
      );

      return_data = {
        success: 1,
        message: 'Settings fetched successfully',
        data: { list: data, pagination },
      };
    } catch (err) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async startModSettingDetails(req: IAppRequest, params: ModSettingDetailsDto) {
    const response = await this.getModSettingDetails(req, params);
    if (response.success == 1) return await this.finishSuccess(response);
    return await this.finishFailure(response);
  }

  async getModSettingDetails(req: IAppRequest, params: ModSettingDetailsDto) {
    let return_data: any = {};
    try {
      if (!params.id) throw new Error('Setting ID is required');

      const queryBuilder = this.repo.createQueryBuilder('setting');
      queryBuilder.select([
        'setting.id AS id',
        'setting.name AS name',
        'setting.code AS code',
        'setting.value AS value',
        'setting.status AS status',
        'setting.addedDate AS addedDate',
        'setting.updatedDate AS updatedDate',
        'setting.addedBy AS addedBy',
        'setting.updatedBy AS updatedBy',
      ]);

      queryBuilder.leftJoin(
        'users',
        'addedByUser',
        'addedByUser.id = setting.addedBy',
      );
      queryBuilder.leftJoin(
        'users',
        'updatedByUser',
        'updatedByUser.id = setting.updatedBy',
      );

      queryBuilder.addSelect(
        "CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)",
        'addedByName',
      );
      queryBuilder.addSelect(
        "CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)",
        'updatedByName',
      );

      queryBuilder.where('setting.id = :id', { id: params.id });
      queryBuilder.andWhere('setting.sysRecDeleted = 0');

      const setting = await queryBuilder.getRawOne();
      if (!setting) throw new Error('Setting not found');

      setting['addedDateFormatted'] = await this.general.dateFormat(
        setting.addedDate,
      );
      if (setting.updatedDate)
        setting['updatedDateFormatted'] = await this.general.dateFormat(
          setting.updatedDate,
        );

      return_data = {
        success: 1,
        message: 'Setting Details Fetched Successfully',
        data: setting,
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
