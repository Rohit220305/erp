import { SaveGroupWithCapabilitiesDto } from '../dto/save-group-with-capabilities.dto';
import { GroupAddDto, GroupUpdateDto, GroupDeleteDto } from '../dto/group.dto';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { GroupEntity } from '../entity/group.entity';
import { CapabilityEntity } from 'src/capability/entity/capability.entity';
import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';
import { PermissionCacheService } from 'src/auth/permission.cache.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';


import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { Status } from 'src/package/common/enums/status.enum';

@Injectable()
export class GroupService {
  constructor(
    private readonly general: GeneralUtilities,
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    private readonly permissionCacheService: PermissionCacheService,
    private readonly dataSource: DataSource,
    private readonly activityLogService: ActivityLogService,
  ) { }

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
      const { id, groupName, groupCode, description, status, capabilityCodes } =
        params;
      const userId = req.user?.sub;

      let groupId = id;

      let oldValue: any = null;
      let newValue: any = null;

      if (id) {
        const group = await queryRunner.manager.findOne(GroupEntity, {
          where: { id, sysRecDeleted: false },
        });

        if (!group) {
          throw new Error('Group not found');
        }

        oldValue = group;
        newValue = {
          groupName,
          groupCode,
          description,
          status,
          capabilityCodes,
        };

        if (groupCode !== group.groupCode) {
          const codeExists = await queryRunner.manager.findOne(GroupEntity, {
            where: { groupCode, sysRecDeleted: false },
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
            description,
            updatedBy: userId,
            updatedDate: () => 'NOW()',
          },
        );
      } else {
        const codeExists = await queryRunner.manager.findOne(GroupEntity, {
          where: { groupCode, sysRecDeleted: false },
        });
        if (codeExists) {
          throw new Error('Group Code already exists');
        }

        const insertRes = await queryRunner.manager.insert(GroupEntity, {
          groupName,
          groupCode,
          description,
          status,
          addedBy: userId,
          addedDate: () => 'NOW()',
        });
        groupId = insertRes.raw.insertId;
      }

      let capabilityIds: number[] = [];
      if (capabilityCodes && capabilityCodes.length > 0) {
        const capabilities = await queryRunner.manager.find(CapabilityEntity, {
          where: capabilityCodes.map((code) => ({
            capabilityCode: code,
            status: Status.Active,
          })),
        });

        if (capabilities.length !== capabilityCodes.length) {
          throw new Error(
            'One or more invalid or inactive capability codes provided',
          );
        }
        capabilityIds = capabilities.map((c) => c.id);
      }

      await queryRunner.manager.delete(GroupCapabilityEntity, { groupId });

      if (capabilityIds.length > 0) {
        const mappings = capabilityIds.map((capId) => ({
          groupId,
          capabilityId: capId,
          status: Status.Active,
          addedBy: userId,
          addedDate: () => 'NOW()',
        }));
        await queryRunner.manager.insert(GroupCapabilityEntity, mappings);
      }

      await queryRunner.commitTransaction();

      await this.permissionCacheService.invalidatePermissions(groupId);

      await this.activityLogService.log({
        activityCode: id ? 'GROUP_UPDATE' : 'GROUP_CREATE',
        companyId: req.user?.companyId,
        actorUserId: userId,
        impersonatorId: req.user?.impersonatorId || undefined,
        entityType: 'GROUP',
        entityId: groupId,
        entityName: groupName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: id
          ? 'Group Updated Successfully.'
          : 'Group Added Successfully.',
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
      const isSuperAdmin =
        req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      const existingGroup = await this.groupRepo.findOne({
        where: {
          groupCode: params.groupCode,
          sysRecDeleted: false,
        },
      });

      if (existingGroup) {
        throw new Error('Group Code already exists');
      }

      const {
        ...dbInsertData
      } = params as any;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedDate = () => 'NOW()';
      dbInsertData.addedBy = req.user?.sub;

      const res = await this.groupRepo.insert(dbInsertData);

      await this.activityLogService.log({
        activityCode: 'GROUP_CREATE',
        companyId: req.user?.companyId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId,
        entityType: 'GROUP',
        entityId: res?.raw?.insertId,
        entityName: params.groupName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

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
      const isSuperAdmin =
        req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      if (!params.id) {
        throw new Error('Group ID is required');
      }

      const group = await this.groupRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      if (params.groupCode && params.groupCode !== group.groupCode) {
        const codeExists = await this.groupRepo.findOne({
          where: {
            groupCode: params.groupCode,
            sysRecDeleted: false,
          },
        });

        if (codeExists) {
          throw new Error('Group Code already exists');
        }
      }

      const {
        id: _extractedId,
        ...dbUpdateData
      } = params as any;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedDate = () => 'NOW()';
      dbUpdateData.updatedBy = req.user?.sub;

      const res = await this.groupRepo.update({ id: params.id }, dbUpdateData);

      await this.activityLogService.log({
        activityCode: 'GROUP_UPDATE',
        companyId: req.user?.companyId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId || undefined,
        entityType: 'GROUP',
        entityId: params.id,
        entityName: params.groupName || group.groupName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

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
      const isSuperAdmin =
        req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        throw new ForbiddenException('Only super admins can modify groups');
      }

      if (!params.id) {
        throw new Error('Group ID is required');
      }

      const group = await this.groupRepo.findOne({
        where: {
          id: params.id,
          sysRecDeleted: false,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      const payload = this.general.buildSoftDeletePayload(
        { groupCode: group.groupCode },
        req,
      );
      const res = await this.groupRepo.update({ id: params.id }, payload);

      await this.activityLogService.log({
        activityCode: 'GROUP_DELETE',
        companyId: req.user?.companyId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId,
        entityType: 'GROUP',
        entityId: params.id,
        entityName: group.groupName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
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

