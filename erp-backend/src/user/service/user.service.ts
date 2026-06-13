import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { USER_INSERT_FIELDS, USER_UPDATE_FIELDS } from 'src/package/constants/user-fields.constant';


@Injectable()
export class UserService {
  constructor(
    private readonly general: GeneralUtilities,
    private readonly commonFileService: CommonFileService,
  ) {}

  @InjectRepository(UserEntity)
  private userRepo: Repository<UserEntity>;

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  async startInsertUser(req, params) {
    const response = await this.insertUser(params);

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

  async insertUser(params) {
    let return_data: any = {};

    try {
      /**
       * Company Validation
       */
      const company = await this.companyRepo.findOne({
        where: {
          id: params.companyId,
        },
      });

      if (!company) {
        throw new Error('Company not found');
      }

      /**
       * Group Validation
       */
      const group = await this.groupRepo.findOne({
        where: {
          id: params.groupId,
        },
      });

      if (!group) {
        throw new Error('Group not found');
      }

      /**
       * Email Validation
       */
      const emailExists = await this.userRepo.findOne({
        where: {
          email: params.email,
        },
      });

      if (emailExists) {
        throw new Error('Email already exists');
      }

      /**
       * Username Validation
       */
      const usernameExists = await this.userRepo.findOne({
        where: {
          userName: params.userName,
        },
      });

      if (usernameExists) {
        throw new Error('Username already exists');
      }

      /**
       * Password Hashing
       */
      params.password = await bcrypt.hash(params.password, 10);

      const queryColumns = await this.general.mapFields(
        params,
        USER_INSERT_FIELDS,
      );

      queryColumns.addedDate = () => 'NOW()';

      const res = await this.userRepo.insert(queryColumns);

      return_data = {
        success: 1,
        message: 'User Added Successfully',
        data: {
          insert_id: res?.raw?.insertId,
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

  async startUpdateUser(req, params) {
    const response = await this.updateUser(params);

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

  async updateUser(params) {
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

      /**
       * Company Validation
       */
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

      /**
       * Group Validation
       */
      if (params.groupId) {
        const group = await this.groupRepo.findOne({
          where: {
            id: params.groupId,
          },
        });

        if (!group) {
          throw new Error('Group not found');
        }
      }

      /**
       * Email Validation
       */
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

      queryColumns.updatedDate = () => 'NOW()';

      const res = await this.userRepo.update(
        {
          id: params.id,
        },
        queryColumns,
      );

      return_data = {
        success: 1,
        message: 'User Updated Successfully',
        data: {
          affected: res.affected,
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

  async startDeleteUser(req, params) {
    const response = await this.deleteUser(params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async deleteUser(params) {
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

      const res = await this.userRepo.delete({
        id: params.id,
      });

      await this.commonFileService.deleteFolder('users', `${params.id}`);

      return_data = {
        success: 1,
        message: 'User Deleted Successfully',
        data: {
          affected: res.affected,
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
