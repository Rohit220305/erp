import { Injectable } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from '../entity/group.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class GroupListService {
  constructor(private readonly general: GeneralUtilities) { }

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  async startGroupDetails(params) {
    const response = await this.getGroupDetails(params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async getGroupDetails(params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('Group ID is required');
      }

      const queryBuilder = this.groupRepo.createQueryBuilder('group_master');

      queryBuilder.select([
        'group_master.id AS id',
        'group_master.groupCode AS groupCode',
        'group_master.groupName AS groupName',
        'group_master.description AS description',
        'group_master.status AS status',
        'group_master.addedDate AS addedDate',
        'group_master.updatedDate AS updatedDate',
        'group_master.addedBy AS addedBy',
        'group_master.updatedBy AS updatedBy',
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = group_master.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = group_master.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('group_master.id = :id', { id: params.id });
      queryBuilder.andWhere('group_master.sysRecDeleted = 0');

      const group = await queryBuilder.getRawOne();

      if (!group) {
        throw new Error('Group not found');
      }

      group.addedDateFormatted = await this.general.dateFormat(
        group.addedDate,
      );

      if (group.updatedDate) {
        group.updatedDateFormatted = await this.general.dateFormat(
          group.updatedDate,
        );
      }

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: group,
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startGroupList(req, params) {
    const response = await this.getGroupList(params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async getGroupList(params) {
    let return_data: any = {};

    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.groupRepo.createQueryBuilder('group_master');

      queryBuilder.select([
        'group_master.id AS id',
        'group_master.groupCode AS groupCode',
        'group_master.groupName AS groupName',
        'group_master.description AS description',
        'group_master.status AS status',
        'group_master.addedDate AS addedDate',
        'group_master.updatedDate AS updatedDate',
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = group_master.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = group_master.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('group_master.sysRecDeleted = 0');

      if (!params?.includeSuperAdmin) {
        queryBuilder.andWhere("LOWER(group_master.groupCode) NOT IN ('superadmin', 'super_admin')");
      }

      await this.general.applyListQuery(queryBuilder, params, 'group_master.groupName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      await this.general.formatDate(data);

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Group List fetched successfully',
        data: {
          list: data,
          pagination,
        },
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async finishSuccess(params) {
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data || [],
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

    if (incomingData) {
      output.settings.incoming_data = incomingData;
    }

    return output;
  }
}
