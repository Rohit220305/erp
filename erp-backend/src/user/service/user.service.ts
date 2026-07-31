import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { USER_INSERT_FIELDS, USER_UPDATE_FIELDS } from 'src/package/constants/user-fields.constant';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { UserGroupEntity } from '../entity/user-group.entity';


@Injectable()
export class UserService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
    private readonly activityLogService: ActivityLogService,
  ) { }

  @InjectRepository(UserEntity)
  private userRepo: Repository<UserEntity>;

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  @InjectRepository(UserGroupEntity)
  private userGroupRepo: Repository<UserGroupEntity>;

  async startInsertUser(req, params) {
    const response = await this.insertUser(req, params);

    if (response.success == 1) {
      if (params.profilePhoto && response?.data?.insert_id) {
        await this.commonFileService.transferFile(
          params.profilePhoto,
          response.data.insert_id,
          'users',
        );
      }

      return await this.finishSuccess(response, params);
    }

    if (params.profilePhoto) {
      await this.commonFileService.deleteTempFile(params.profilePhoto);
    }

    return await this.finishFailure(response);
  }

  async insertUser(req, params) {
    let return_data: any = {};

    try {
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && params.companyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot create user outside your company');
      }


      const groupIds: number[] = params.groupIds || (params.groupId ? [Number(params.groupId)] : []);

      if (!params.isSuperAdmin) {
        if (!params.companyId) {
          throw new Error('Please select a company');
        }
        const company = await this.companyRepo.findOne({
          where: {
            id: params.companyId,
          },
        });

        if (!company) {
          throw new Error('Company not found');
        }

        if (!groupIds || groupIds.length === 0) {
          throw new Error('Please select at least one group');
        }

        for (const gid of groupIds) {
          const group = await this.groupRepo.findOne({
            where: {
              id: gid,
            },
          });
          if (!group) {
            throw new Error(`Group not found (ID: ${gid})`);
          }
        }
      }


      const emailExists = await this.userRepo.findOne({
        where: {
          email: params.email,
        },
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }


      const usernameExists = await this.userRepo.findOne({
        where: {
          userName: params.userName,
        },
      });

      if (usernameExists) {
        throw new Error('Username already exists');
      }

      params.password = await bcrypt.hash(params.password, 10);

      const queryColumns = await this.general.mapFields(
        params,
        USER_INSERT_FIELDS,
      );

      queryColumns.addedBy = req.user?.sub;
      queryColumns.addedDate = () => 'NOW()';

      const res = await this.userRepo.insert(queryColumns);
      const insertId = res?.raw?.insertId;

      if (insertId && groupIds.length > 0) {
        const userGroupsToInsert = groupIds.map((gid, index) => ({
          userId: insertId,
          groupId: gid,
          isPrimary: index === 0 ? true : false,
          status: 'Active',
          addedBy: req.user?.sub,
        }));

        await this.userGroupRepo.insert(userGroupsToInsert);
      }

      await this.activityLogService.log({
        activityCode: 'USER_CREATE',
        companyId: params.companyId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId,
        entityType: 'USER',
        entityId: res?.raw?.insertId,
        entityName: params.userName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: 'User Added Successfully',
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

  async startUpdateUser(req, params) {
    const response = await this.updateUser(req, params);

    if (response.success == 1) {
      if (params.profilePhoto && params.id) {
        await this.commonFileService.transferFile(
          params.profilePhoto,
          params.id,
          'users',
        );
      }

      return await this.finishSuccess(response);
    }

    if (params.profilePhoto) {
      await this.commonFileService.deleteTempFile(params.profilePhoto);
    }

    return await this.finishFailure(response);
  }

  async updateUser(req, params) {
    let return_data: any = {};

    try {
      if (!params.id) {
        throw new Error('User ID is required');
      }

      const user = await this.userRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && user.companyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot update user outside your company');
      }
      if (!isSuperAdmin && params.companyId && params.companyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot move user outside your company');
      }

  
      if (params.companyId) {
        const company = await this.companyRepo.findOne({
          where: {
            id: params.companyId,
          },
        });

        if (!company) {
          throw new Error('Company not found');
        }
      }

      const groupIds: number[] | undefined = params.groupIds || (params.groupId ? [Number(params.groupId)] : undefined);
      if (groupIds && groupIds.length > 0) {
        for (const gid of groupIds) {
          const group = await this.groupRepo.findOne({
            where: {
              id: gid,
            },
          });
          if (!group) {
            throw new Error(`Group not found (ID: ${gid})`);
          }
        }
      }

     
      if (params.email && params.email !== user.email) {
        const emailExists = await this.userRepo.findOne({
          where: {
            email: params.email,
          },
        });

        if (emailExists) {
          throw new Error('Email already exists');
        }
      }

      /**
       * Username Validation
       */
      if (params.userName && params.userName !== user.userName) {
        const usernameExists = await this.userRepo.findOne({
          where: {
            userName: params.userName,
          },
        });

        if (usernameExists) {
          throw new Error('Username already exists');
        }
      }

      /**
       * Password Hashing
       */
      if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
      }

      const queryColumns = await this.general.mapFields(
        params,
        USER_UPDATE_FIELDS,
      );

      queryColumns.updatedBy = req.user?.sub;
      queryColumns.updatedDate = () => 'NOW()';

      const res = await this.userRepo.update(
        {
          id: params.id,
        },
        queryColumns,
      );

      if (groupIds && groupIds.length > 0) {
        await this.userGroupRepo.delete({ userId: params.id });
        const userGroupsToInsert = groupIds.map((gid, index) => ({
          userId: params.id,
          groupId: gid,
          isPrimary: index === 0 ? true : false,
          status: 'Active',
          addedBy: req.user?.sub,
        }));

        await this.userGroupRepo.insert(userGroupsToInsert);
      }

      await this.activityLogService.log({
        activityCode: 'USER_UPDATE',
        companyId: user.companyId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId || undefined,
        entityType: 'USER',
        entityId: params.id,
        entityName: params.userName || user.userName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: 'User Updated Successfully',
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

  async startDeleteUser(req, params) {
    const response = await this.deleteUser(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async deleteUser(req, params) {
    let return_data: any = {};

    try {
      const user = await this.userRepo.findOne({
        where: {
          id: params.id,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && user.companyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot delete user outside your company');
      }

      const res = await this.userRepo.delete({
        id: params.id,
      });

      await this.commonFileService.deleteFolder('users', `${params.id}`);

      await this.activityLogService.log({
        activityCode: 'USER_DELETE',
        companyId: user.companyId,
        actorUserId: req.user?.sub,
        impersonatorId: req.user?.impersonatorId,
        entityType: 'USER',
        entityId: params.id,
        entityName: user.userName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return_data = {
        success: 1,
        message: 'User Deleted Successfully',
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
    return {
      settings: {
        success: params?.success,
        message: params?.message,
        data: params?.data || [],
        incoming_data: incomingData || {},
      },
    };
  }

  async finishFailure(params) {
    return params;
  }
}
