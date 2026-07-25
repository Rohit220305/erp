import { Injectable } from '@nestjs/common';
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

      const group = await this.groupRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      group['addedDateFormatted'] = await this.general.dateFormat(
        group.addedDate,
      );

      if (group.updatedDate) {
        group['updatedDateFormatted'] = await this.general.dateFormat(
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
      const page = params.page ? parseInt(params.page) : 1;

      const limit = params.limit ? parseInt(params.limit) : 10;

      const skip = (page - 1) * limit;

      const queryBuilder = this.groupRepo.createQueryBuilder('group_master');

      if (!params?.includeSuperAdmin) {
        queryBuilder.andWhere("LOWER(group_master.groupCode) NOT IN ('superadmin', 'super_admin')");
      }



      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            group_master.groupCode LIKE :search
            OR group_master.groupName LIKE :search
            OR group_master.description LIKE :search
          )
          `,
          {
            search: `%${params.search}%`,
          },
        );
      }


      if (params?.filters) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          'group_master',
          params.logicalOperator
        );

        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      const allowedSortFields = {
        groupCode: 'group_master.groupCode',
        groupName: 'group_master.groupName',
        description: 'group_master.description',
        status: 'group_master.status',
        addedDateFormatted: 'group_master.addedDate',
        id: 'group_master.id',
      };

      if (params?.sortField && params?.sortOrder && allowedSortFields[params.sortField]) {
        const order = params.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(allowedSortFields[params.sortField], order);
      } else {
        queryBuilder.orderBy('group_master.groupName', 'ASC');
      }

      queryBuilder.skip(skip);
      queryBuilder.take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      for (const group of data) {
        group['addedDateFormatted'] = await this.general.dateFormat(
          group.addedDate,
        );

        if (group.updatedDate) {
          group['updatedDateFormatted'] = await this.general.dateFormat(
            group.updatedDate,
          );
        }
      }

      return_data = {
        success: 1,
        message: 'Group List fetched successfully',
        data: {
          list: data,
          pagination: {
            total,
            page,
            limit,
            total_pages: Math.ceil(total / limit),
            prevPage: page > 1,
            nextPage: total > skip + limit,
          },
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

  async finishFailure(params) {
    return params;
  }
}
