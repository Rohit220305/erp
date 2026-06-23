import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { GroupEntity } from '../entity/group.entity';
import { CapabilityEntity } from 'src/capability/entity/capability.entity';
import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';
import { PermissionCacheService } from 'src/auth/permission.cache.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';

import {
  GROUP_INSERT_FIELDS,
  GROUP_UPDATE_FIELDS,
} from 'src/package/constants/group-fields.constant';

@Injectable()
export class GroupService {
  constructor(
    private readonly general: GeneralUtilities,
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    private readonly permissionCacheService: PermissionCacheService,
    private readonly dataSource: DataSource,
  ) {}

  async startSaveWithCapabilities(req, params) {
    const response = await this.saveWithCapabilities(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async saveWithCapabilities(req, params) {
    let return_data: any = {};
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { id, groupName, groupCode, status, capabilityCodes } = params;
      const userId = req.user?.sub;

      let groupId = id;

      // 1. Group validation & insert/update
      if (id) {
        // Update mode
        const group = await queryRunner.manager.findOne(GroupEntity, {
          where: { id },
        });

        if (!group) {
          throw new Error('Group not found');
        }

        // Check code uniqueness if changing code
        if (groupCode !== group.groupCode) {
          const codeExists = await queryRunner.manager.findOne(GroupEntity, {
            where: { groupCode },
          });
          if (codeExists) {
            throw new Error('Group Code already exists');
          }
        }

        await queryRunner.manager.update(
          GroupEntity,
          { id },
          {
            groupName,
            groupCode,
            status,
            updatedBy: userId,
            updatedDate: () => 'NOW()',
          },
        );
      } else {
        // Add mode
        const codeExists = await queryRunner.manager.findOne(GroupEntity, {
          where: { groupCode },
        });
        if (codeExists) {
          throw new Error('Group Code already exists');
        }

        const insertRes = await queryRunner.manager.insert(GroupEntity, {
          groupName,
          groupCode,
          status,
          addedBy: userId,
          addedDate: () => 'NOW()',
        });
        groupId = insertRes.raw.insertId;
      }

      // 2. Fetch Capability IDs for the provided codes
      // Reject if any capability code is invalid
      let capabilityIds: number[] = [];
      if (capabilityCodes && capabilityCodes.length > 0) {
        const capabilities = await queryRunner.manager.find(CapabilityEntity, {
          where: capabilityCodes.map((code) => ({ capabilityCode: code, status: 'Active' })),
        });

        if (capabilities.length !== capabilityCodes.length) {
          throw new Error('One or more invalid or inactive capability codes provided');
        }
        capabilityIds = capabilities.map((c) => c.id);
      }

      // 3. Delete existing capabilities for the group
      await queryRunner.manager.delete(GroupCapabilityEntity, { groupId });

      // 4. Insert new capability mappings
      if (capabilityIds.length > 0) {
        const mappings = capabilityIds.map((capId) => ({
          groupId,
          capabilityId: capId,
          status: 'Active',
          addedBy: userId,
          addedDate: () => 'NOW()',
        }));
        await queryRunner.manager.insert(GroupCapabilityEntity, mappings);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // 5. Invalidate permission cache
      await this.permissionCacheService.invalidatePermissions(groupId);

      return_data = {
        success: 1,
        message: id ? 'Group Updated Successfully.' : 'Group Added Successfully.',
        data: {
          id: groupId,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return_data = {
        success: 0,
        message: err.message,
      };
    } finally {
      await queryRunner.release();
    }

    return return_data;
  }

  async startInsertGroup(req, params) {
    const response = await this.insertGroup(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async insertGroup(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      const existingGroup = await this.groupRepo.findOne({
        where: {
          groupCode: params.groupCode,
        },
      });

      if (existingGroup) {
        throw new Error('Group Code already exists');
      }

      const queryColumns = await this.general.mapFields(
        params,
        GROUP_INSERT_FIELDS,
      );

      queryColumns.addedDate = () => 'NOW()';
      queryColumns.addedBy = req.user?.sub;

      const res = await this.groupRepo.insert(queryColumns);

      return_data = {
        success: 1,
        message: 'Group Added Successfully.',
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

  async startUpdateGroup(req, params) {
    const response = await this.updateGroup(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async updateGroup(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

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

      if (params.groupCode && params.groupCode !== group.groupCode) {
        const codeExists = await this.groupRepo.findOne({
          where: {
            groupCode: params.groupCode,
          },
        });

        if (codeExists) {
          throw new Error('Group Code already exists');
        }
      }

      const queryColumns = await this.general.mapFields(
        params,
        GROUP_UPDATE_FIELDS,
      );

      queryColumns.updatedDate = () => 'NOW()';
      queryColumns.updatedBy = req.user?.sub;

      const res = await this.groupRepo.update({ id: params.id }, queryColumns);

      return_data = {
        success: 1,
        message: 'Group Updated Successfully.',
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

  async startDeleteGroup(req, params) {
    const response = await this.deleteGroup(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async deleteGroup(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

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

      const res = await this.groupRepo.delete({
        id: params.id,
      });

      return_data = {
        success: 1,
        message: 'Group Deleted Successfully.',
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

