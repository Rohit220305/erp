import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupCapabilityEntity } from '../entity/group-capability.entity';
import { CapabilityEntity } from '../entity/capability.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class GroupCapabilityListService {
  constructor(
    private readonly general: GeneralUtilities,
    @InjectRepository(GroupCapabilityEntity)
    private readonly groupCapabilityRepo: Repository<GroupCapabilityEntity>,
    @InjectRepository(CapabilityEntity)
    private readonly capabilityRepo: Repository<CapabilityEntity>,
  ) {}

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
        where: { groupId, status: 'Active' },
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
      const page = params.page ? parseInt(params.page) : 1;
      const limit = params.limit ? parseInt(params.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.groupCapabilityRepo.createQueryBuilder('group_capabilities')
        .leftJoinAndSelect('group_capabilities.group', 'group')
        .leftJoinAndSelect('group_capabilities.capability', 'capability');

      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            group.groupName LIKE :search
            OR capability.capabilityName LIKE :search
            OR capability.capabilityCode LIKE :search
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
          'group_capabilities',
        );
        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      queryBuilder.orderBy('group_capabilities.id', 'ASC');
      queryBuilder.skip(skip);
      queryBuilder.take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      for (const item of data) {
        item['addedDateFormatted'] = await this.general.dateFormat(
          item.addedDate,
        );
        if (item.updatedDate) {
          item['updatedDateFormatted'] = await this.general.dateFormat(
            item.updatedDate,
          );
        }
      }

      return_data = {
        success: 1,
        message: 'Group Capability Mappings fetched successfully',
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
        where: { status: 'Active' },
        order: { moduleName: 'ASC', actionName: 'ASC' },
      });

      let assignedCapIds = new Set<number>();
      if (groupId) {
        const mappings = await this.groupCapabilityRepo.find({
          where: { groupId, status: 'Active' },
        });
        assignedCapIds = new Set(mappings.map((m) => m.capabilityId));
      }
      // console.log("Assigned Capability IDs:", assignedCapIds);
      // console.log("All Capabilities:", allCapabilities);
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

  async finishFailure(params) {
    return params;
  }
}

