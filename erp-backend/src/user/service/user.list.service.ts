import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Injectable()
export class UserListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(UserEntity)
  private userRepo: Repository<UserEntity>;

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  async startUserDetails(params) {
    const response = await this.getUserDetails(params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async getUserDetails(params) {
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
       * Company Name
       */
      const company = await this.companyRepo.findOne({
        where: {
          id: user.companyId,
        },
      });

      /**
       * Group Name
       */
      const group = await this.groupRepo.findOne({
        where: {
          id: user.groupId,
        },
      });

      user['companyName'] = company?.companyName || '';

      user['groupName'] = group?.groupName || '';

      user['addedDateFormatted'] = await this.general.dateFormat(
        user.addedDate,
      );

      if (user.updatedDate) {
        user['updatedDateFormatted'] = await this.general.dateFormat(
          user.updatedDate,
        );
      }

      if (user.lastLoginDate) {
        user['lastLoginDateFormatted'] = await this.general.dateFormat(
          user.lastLoginDate,
        );
      }

      /**
       * Profile Photo URL
       */
      if (user.profilePhoto) {
        user['photoUrl'] = await this.general.generateUrl(
          'users',
          `${user.id}`,
          user.profilePhoto,
        );
      }

      /**
       * Hide Password
       */
      //   delete user.password;
      const { password, ...safeUser } = user;

      return_data = {
        success: 1,
        data: safeUser,
      };
    } catch (err) {
      return_data = {
        success: 0,
        message: err.message,
      };
    }

    return return_data;
  }

  async startUserList(req, params) {
    const response = await this.getUserList(params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async getUserList(params) {
    let return_data: any = {};

    try {
      const page = params.page ? parseInt(params.page) : 1;

      const limit = params.limit ? parseInt(params.limit) : 10;

      const skip = (page - 1) * limit;

      const queryBuilder = this.userRepo.createQueryBuilder('user');

      /**
       * Search
       */
      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            user.userName LIKE :search
            OR user.firstName LIKE :search
            OR user.lastName LIKE :search
            OR user.email LIKE :search
          )
          `,
          {
            search: `%${params.search}%`,
          },
        );
      }

      /**
       * Filters
       */
      if (params?.filters) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          'user',
          params.logicalOperator
        );

        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      queryBuilder.orderBy('user.id', 'ASC');

      queryBuilder.skip(skip);
      queryBuilder.take(limit);

      const [data, total] = await queryBuilder.getManyAndCount();

      const userList: any[] = [];

      for (const user of data) {
        const company = await this.companyRepo.findOne({
          where: {
            id: user.companyId,
          },
        });

        const group = await this.groupRepo.findOne({
          where: {
            id: user.groupId,
          },
        });

        const { password, ...safeUser } = user;

        safeUser['companyName'] = company?.companyName || '';

        safeUser['groupName'] = group?.groupName || '';

        safeUser['addedDateFormatted'] = await this.general.dateFormat(
          user.addedDate,
        );

        if (user.updatedDate) {
          safeUser['updatedDateFormatted'] = await this.general.dateFormat(
            user.updatedDate,
          );
        }

        if (user.lastLoginDate) {
          safeUser['lastLoginDateFormatted'] = await this.general.dateFormat(
            user.lastLoginDate,
          );
        }

        if (user.profilePhoto) {
          safeUser['photoUrl'] = await this.general.generateUrl(
            'users',
            `${user.id}`,
            user.profilePhoto,
          );
        }

        userList.push(safeUser);
      }
      return_data = {
        success: 1,
        message: 'User List fetched successfully',
        data: {
          list: userList,
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
