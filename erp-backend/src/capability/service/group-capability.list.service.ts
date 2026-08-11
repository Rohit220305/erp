import { Injectable } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupCapabilityEntity } from '../entity/group-capability.entity';
import { CapabilityEntity } from '../entity/capability.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { Status } from 'src/package/common/enums/status.enum';

@Injectable()
export class GroupCapabilityListService {
  constructor(
    private readonly general: GeneralUtilities,
    @InjectRepository(GroupCapabilityEntity)
    private readonly groupCapabilityRepo: Repository<GroupCapabilityEntity>,
    @InjectRepository(CapabilityEntity)
    private readonly capabilityRepo: Repository<CapabilityEntity>,
  ) { }

  async startGetByGroup(params) {
    const response = await this.getByGroup(params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getByGroup(params) {
    let return_data: any = {};
    try {
      const { groupId } = params;
      if (!groupId) {
        throw new Error('Group ID is required');
      }

      const list = await this.groupCapabilityRepo.find({
        where: { groupId, status: Status.Active },
        relations: { capability: true },
      });

      const capabilities = list.map((gc) => gc.capability).filter(Boolean);

      return_data = {
        success: 1,
        message: 'Group capabilities retrieved successfully',
        data: capabilities,
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }
    return return_data;
  }

  async startListGroupCapabilities(req, params) {
    const response = await this.listGroupCapabilities(params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async listGroupCapabilities(params) {
    let return_data: any = {};
    try {
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.groupCapabilityRepo.createQueryBuilder('group_capabilities')
        .leftJoin('group_capabilities.group', 'group')
        .leftJoin('group_capabilities.capability', 'capability');

      queryBuilder.select([
        'group_capabilities.id AS id',
        'group_capabilities.groupId AS groupId',
        'group_capabilities.capabilityId AS capabilityId',
        'group_capabilities.status AS status',
        'group_capabilities.addedBy AS addedBy',
        'group_capabilities.addedDate AS addedDate',
        'group_capabilities.updatedBy AS updatedBy',
        'group_capabilities.updatedDate AS updatedDate',
        'group.groupName AS groupName',
        'capability.capabilityName AS capabilityName',
        'capability.capabilityCode AS capabilityCode'
      ]);

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = group_capabilities.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = group_capabilities.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('group_capabilities.sysRecDeleted = 0');

      await this.general.applyListQuery(queryBuilder, params, 'group_capabilities.id');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);
      const data = await queryBuilder.getRawMany();

      for (const item of data) {
        item['addedDateFormatted'] = await this.general.dateFormat(
          item.addedDate,
        );
        if (item.updatedDate) {
          item['updatedDateFormatted'] = await this.general.dateFormat(
            item.updatedDate,
          );
        }

        item.group = {
          id: item.groupId,
          groupName: item.groupName,
        };
        item.capability = {
          id: item.capabilityId,
          capabilityName: item.capabilityName,
          capabilityCode: item.capabilityCode,
        };
      }

      const pagination = this.general.buildPaginationResponse(total, page, limit, skip);

      return_data = {
        success: 1,
        message: 'Group Capability Mappings fetched successfully',
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

  async startGetMatrix(groupId?: number) {
    const response = await this.getMatrix(groupId);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getMatrix(groupId?: number) {
    let return_data: any = {};
    try {
      const allCapabilities = await this.capabilityRepo.find({
        where: { status: Status.Active },
        order: { moduleName: 'ASC', actionName: 'ASC' },
      });

      let assignedCapIds = new Set<number>();
      if (groupId) {
        const mappings = await this.groupCapabilityRepo.find({
          where: { groupId, status: Status.Active },
        });
        assignedCapIds = new Set(mappings.map((m) => m.capabilityId));
      }
      const matrix = allCapabilities.map((cap) => ({
        id: cap.id,
        moduleName: cap.moduleName,
        capabilityCode: cap.capabilityCode,
        capabilityName: cap.capabilityName,
        actionName: cap.actionName,
        assigned: assignedCapIds.has(cap.id),
      }));
      return_data = {
        success: 1,
        message: 'Capability matrix retrieved successfully',
        data: matrix,
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

