import { UserAddDto, UserUpdateDto, UserDeleteDto } from '../dto/user.dto';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { UserGroupEntity } from '../entity/user-group.entity';
import { Status } from 'src/package/common/enums/enum';


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
      this.general.assertCompanyAccess(req, params.companyId, 'create', 'user');


      const groupIds: number[] = params.groupIds || (params.groupId ? [Number(params.groupId)] : []);

      if (!params.isSuperAdmin) {
        if (!params.companyId) {
          throw new Error('Please select a company');
        }

        if (!groupIds || groupIds.length === 0) {
          throw new Error('Please select at least one group');
        }

        const [company, emailExists, usernameExists, foundGroups] = await Promise.all([
          this.companyRepo.findOne({ where: { id: params.companyId } }),
          this.userRepo.findOne({ where: { email: params.email } }),
          this.userRepo.findOne({ where: { userName: params.userName } }),
          this.groupRepo.find({ where: { id: In(groupIds) } }),
        ]);

        if (!company) throw new Error('Company not found');
        if (emailExists) throw new Error('Email already exists');
        if (usernameExists) throw new Error('Username already exists');

        if (foundGroups.length !== groupIds.length) {
          const foundIds = foundGroups.map(g => g.id);
          const missingId = groupIds.find(gid => !foundIds.includes(gid));
          throw new Error(`Group not found (ID: ${missingId})`);
        }
      } else {
        const [emailExists, usernameExists] = await Promise.all([
          this.userRepo.findOne({ where: { email: params.email } }),
          this.userRepo.findOne({ where: { userName: params.userName } }),
        ]);

        if (emailExists) throw new Error('Email already exists');
        if (usernameExists) throw new Error('Username already exists');
      }

      params.password = await bcrypt.hash(params.password, 10);

      const {
        groupIds: _extractedGroupIds,
        groupId: _extractedGroupId,
        ...dbInsertData
      } = params;

      Object.keys(dbInsertData).forEach(key => {
        if (dbInsertData[key] === undefined || dbInsertData[key] === null) {
          delete dbInsertData[key];
        }
      });

      dbInsertData.addedBy = req.user?.sub;
      dbInsertData.addedDate = () => 'NOW()';

      const res = await this.userRepo.insert(dbInsertData);
      const insertId = res?.raw?.insertId;

      if (insertId && groupIds.length > 0) {
        const userGroupsToInsert = groupIds.map((gid, index) => ({
          userId: insertId,
          groupId: gid,
          isPrimary: index === 0 ? true : false,
          status: Status.Active,
          addedBy: req.user?.sub,
        }));

        await this.userGroupRepo.insert(userGroupsToInsert);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'USER_CREATE',
        'USER',
        res?.raw?.insertId,
        params.userName,
        params.companyId,
      );
      await this.activityLogService.log(logPayload);

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

      this.general.assertCompanyAccess(req, user.companyId, 'update', 'user');
      if (params.companyId) {
        this.general.assertCompanyAccess(req, params.companyId, 'move', 'user');
      }

      const groupIds: number[] | undefined =
        params.groupIds ||
        (params.groupId ? [Number(params.groupId)] : undefined);

      const parallelChecks: Promise<any>[] = [];

      parallelChecks.push(
        params.companyId
          ? this.companyRepo.findOne({ where: { id: params.companyId } })
          : Promise.resolve(null),
      );

      parallelChecks.push(
        groupIds && groupIds.length > 0
          ? this.groupRepo.find({ where: { id: In(groupIds) } })
          : Promise.resolve(null),
      );

      parallelChecks.push(
        params.email && params.email !== user.email
          ? this.userRepo.findOne({ where: { email: params.email } })
          : Promise.resolve(null),
      );

      parallelChecks.push(
        params.userName && params.userName !== user.userName
          ? this.userRepo.findOne({ where: { userName: params.userName } })
          : Promise.resolve(null),
      );

      const [company, foundGroups, emailExists, usernameExists] = await Promise.all(parallelChecks);

      if (params.companyId && !company) throw new Error('Company not found');
      if (groupIds && groupIds.length > 0 && foundGroups) {
        if (foundGroups.length !== groupIds.length) {
          const foundIds = foundGroups.map(g => g.id);
          const missingId = groupIds.find(gid => !foundIds.includes(gid));
          throw new Error(`Group not found (ID: ${missingId})`);
        }
      }
      if (emailExists) throw new Error('Email already exists');
      if (usernameExists) throw new Error('Username already exists');

      if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
      }

      const {
        id: _extractedId,
        groupIds: _extractedGroupIds,
        groupId: _extractedGroupId,
        ...dbUpdateData
      } = params;

      Object.keys(dbUpdateData).forEach(key => {
        if (dbUpdateData[key] === undefined || dbUpdateData[key] === null) {
          delete dbUpdateData[key];
        }
      });

      dbUpdateData.updatedBy = req.user?.sub;
      dbUpdateData.updatedDate = () => 'NOW()';

      const res = await this.userRepo.update(
        {
          id: params.id,
        },
        dbUpdateData,
      );

      if (groupIds && groupIds.length > 0) {
        await this.userGroupRepo.delete({ userId: params.id });
        const userGroupsToInsert = groupIds.map((gid, index) => ({
          userId: params.id,
          groupId: gid,
          isPrimary: index === 0 ? true : false,
          status: Status.Active,
          addedBy: req.user?.sub,
        }));

        await this.userGroupRepo.insert(userGroupsToInsert);
      }

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'USER_UPDATE',
        'USER',
        params.id,
        params.userName || user.userName,
        user.companyId,
      );
      await this.activityLogService.log(logPayload);

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
          sysRecDeleted: false,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      this.general.assertCompanyAccess(req, user.companyId, 'delete', 'user');

      const payload = this.general.buildSoftDeletePayload(
        { email: user.email, userName: user.userName },
        req,
      );
      const res = await this.userRepo.update({ id: params.id }, payload);

      const logPayload = this.general.buildActivityLogPayload(
        req,
        'USER_DELETE',
        'USER',
        params.id,
        user.userName,
        user.companyId,
      );
      await this.activityLogService.log(logPayload);

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
        // incoming_data: incomingData || {},
      },
    };
  }

  async finishFailure(params, incomingData?) {
    return {
      settings: {
        success: params?.success || 0,
        message: params?.message || 'something went wrong',
        data: params?.data || [],
        // incoming_data: incomingData || {},
      },
    };
  }
}
