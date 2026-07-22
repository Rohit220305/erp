import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupCapabilityEntity } from '../entity/group-capability.entity';
import { GroupEntity } from 'src/group/entity/group.entity';
import { CapabilityEntity } from '../entity/capability.entity';

@Injectable()
export class GroupCapabilityService {
  @InjectRepository(GroupCapabilityEntity)
  private groupCapabilityRepo: Repository<GroupCapabilityEntity>;

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  @InjectRepository(CapabilityEntity)
  private capabilityRepo: Repository<CapabilityEntity>;

  async startAssignGroupCapabilities(req, params) {
    const response = await this.assignGroupCapabilities(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async assignGroupCapabilities(req, params) {
    let return_data: any = {};
    try {
      const { groupId, capabilityIds } = params;

      const groupExists = await this.groupRepo.findOne({
        where: { id: groupId },
      });
      if (!groupExists) {
        throw new Error('Group not found');
      }

      const insertedIds: number[] = [];
      for (const capId of capabilityIds) {
        
        const capExists = await this.capabilityRepo.findOne({
          where: { id: capId },
        });
        if (!capExists) {
          continue; 
        }

        let mapping = await this.groupCapabilityRepo.findOne({
          where: { groupId, capabilityId: capId },
        });

        if (!mapping) {
          const newMap = new GroupCapabilityEntity();
          newMap.groupId = groupId;
          newMap.capabilityId = capId;
          newMap.status = 'Active';
          if (req.user) {
            newMap.addedBy = req.user.sub;
          }
          newMap.addedDate = new Date();
          const saved = await this.groupCapabilityRepo.save(newMap);
          insertedIds.push(saved.id);
        }
      }

      return_data = {
        success: 1,
        message: 'Capabilities Assigned Successfully.',
        data: {
          insertedIds,
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

  async startRemoveGroupCapability(req, params) {
    const response = await this.removeGroupCapability(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async removeGroupCapability(req, params) {
    let return_data: any = {};
    try {
      const { groupId, capabilityId } = params;

      const mapping = await this.groupCapabilityRepo.findOne({
        where: { groupId, capabilityId },
      });

      if (!mapping) {
        throw new Error('Assignment mapping not found');
      }

      await this.groupCapabilityRepo.delete({ id: mapping.id });

      return_data = {
        success: 1,
        message: 'Capability Removed from Group Successfully.',
        data: {
          affected: 1,
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
