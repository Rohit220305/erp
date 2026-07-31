import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { UserGroupEntity } from '../entity/user-group.entity';

@Injectable()
export class UserListService {
  constructor(private readonly general: GeneralUtilities) {}

  @InjectRepository(UserEntity)
  private userRepo: Repository<UserEntity>;

  @InjectRepository(CompanyEntity)
  private companyRepo: Repository<CompanyEntity>;

  @InjectRepository(GroupEntity)
  private groupRepo: Repository<GroupEntity>;

  @InjectRepository(UserGroupEntity)
  private userGroupRepo: Repository<UserGroupEntity>;

  async startUserDetails(req, params) {
    const response = await this.getUserDetails(req, params);
    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async getUserDetails(req, params) {
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

      const isSuperAdmin =
        req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && user.companyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot view user outside your company');
      }

      const company = await this.companyRepo.findOne({
        where: {
          id: user.companyId,
        },
      });

      const userGroups = await this.userGroupRepo.find({
        where: {
          userId: user.id,
          status: 'Active',
        },
        order: {
          isPrimary: 'DESC',
        },
      });

      const groupIds = userGroups.map((ug) => ug.groupId);

      let groups: GroupEntity[] = [];
      if (groupIds.length > 0) {
        groups = await this.groupRepo.find({
          where: {
            id: In(groupIds),
          },
        });
      }
      const mappedGroups = userGroups.map((ug) => {
        const g = groups.find((grp) => grp.id === ug.groupId);
        return {
          groupId: ug.groupId,
          groupName: g?.groupName || '',
          groupCode: g?.groupCode || '',
          isPrimary: ug.isPrimary === true || (ug.isPrimary as any) === 1,
        };
      });

      user['companyName'] = company?.companyName || '';

      user['groups'] = mappedGroups;
      user['groupName'] = mappedGroups[0]?.groupName || '';

      user['groupNames'] = mappedGroups
        .map((g) => g.groupName)
        .filter(Boolean)
        .join(', ');

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

      if (user.profilePhoto) {
        user['photoUrl'] = await this.general.generateUrl(
          'users',
          `${user.id}`,
          user.profilePhoto,
        );
      }

      const { password, ...safeUser } = user;

      return_data = {
        success: 1,
        data: safeUser,
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

  async startUserList(req, params) {
    const response = await this.getUserList(req, params);

    if (response.success == 1) {
      return await this.finishSuccess(response);
    }

    return await this.finishFailure(response);
  }

  async getUserList(req, params) {
    let return_data: any = {};
    try {
      const page = params.page ? parseInt(params.page) : 1;

      const limit = params.limit ? parseInt(params.limit) : 10;

      const skip = (page - 1) * limit;

      const queryBuilder = this.userRepo.createQueryBuilder('user');

      queryBuilder.leftJoin(
        CompanyEntity,
        'company',
        'company.id = user.companyId',
      );

      queryBuilder.leftJoin(
        UserGroupEntity,
        'primaryUserGroup',
        'primaryUserGroup.userId = user.id AND primaryUserGroup.isPrimary = 1 ',
      );

      queryBuilder.leftJoin(
        GroupEntity,
        'primaryGroup',
        'primaryGroup.id = primaryUserGroup.groupId',
      );

      const isSuperAdmin =
        req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        queryBuilder.andWhere('user.companyId = :scopedCompanyId', {
          scopedCompanyId: req.user.companyId,
        });
      }

      let groupFilterIds: number[] = [];

      if (params?.filters && Array.isArray(params.filters)) {
        const remainingFilters: any[] = [];
        for (const f of params.filters) {
          if (f.key === 'groupId' || f.key === 'groupName') {
            if (Array.isArray(f.value)) {
               groupFilterIds = f.value.map(v => Number(v)).filter(v => !isNaN(v) && v > 0);
            } else {
               const parsed = Number(f.value);
               if (!isNaN(parsed) && parsed > 0) {
                 groupFilterIds.push(parsed);
               }
            }
          } else {
            remainingFilters.push(f);
          }
        }
        params.filters = remainingFilters;
      }

      if (groupFilterIds.length > 0) {
        queryBuilder.andWhere(
          `EXISTS (SELECT 1 FROM user_groups ug WHERE ug.userId = user.id AND ug.groupId IN (:...filterGroupIds) AND ug.status = 'Active')`,
          { filterGroupIds: groupFilterIds },
        );
      }

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

      const columnMap: Record<string, string> = {
        firstName: 'user.firstName',
        lastName: 'user.lastName',
        email: 'user.email',
        userName: 'user.userName',
        status: 'user.status',
        companyName: 'company.companyName',
        companyId: 'user.companyId',
        id: 'user.id',
        groupName: 'primaryGroup.groupName',
      };

      if (params?.filters && params.filters.length > 0) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          columnMap,
          params.logicalOperator,
        );
        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      if (
        params?.sortField &&
        params?.sortOrder &&
        columnMap[params.sortField]
      ) {
        const order =
          params.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(columnMap[params.sortField], order);
      } else {
        queryBuilder.orderBy('user.firstName', 'ASC');
      }

      queryBuilder.offset(skip);
      queryBuilder.limit(limit);

      const [data, total] = await queryBuilder.getManyAndCount();
      const userList: any[] = [];
      const userIds = data.map((u) => u.id);

      let allUserGroups: UserGroupEntity[] = [];
      let allGroups: GroupEntity[] = [];

      if (userIds.length > 0) {
        allUserGroups = await this.userGroupRepo.find({
          where: {
            userId: In(userIds),
            status: 'Active',
          },
          order: {
            isPrimary: 'DESC',
          },
        });

        const allGroupIds = Array.from(
          new Set(allUserGroups.map((ug) => ug.groupId)),
        );
        if (allGroupIds.length > 0) {
          allGroups = await this.groupRepo.find({
            where: {
              id: In(allGroupIds),
            },
          });
        }
      }

      for (const user of data) {
        const company = await this.companyRepo.findOne({
          where: {
            id: user.companyId,
          },
        });

        const uUserGroups = allUserGroups.filter((ug) => ug.userId === user.id);
        const mappedGroups = uUserGroups.map((ug) => {
          const g = allGroups.find((grp) => grp.id === ug.groupId);
          return {
            groupId: ug.groupId,
            groupName: g?.groupName || '',
            groupCode: g?.groupCode || '',
            isPrimary: ug.isPrimary === true || (ug.isPrimary as any) === 1,
          };
        });

        const { password, ...safeUser } = user;

        safeUser['companyName'] = company?.companyName || '';
        safeUser['groups'] = mappedGroups;
        safeUser['groupName'] = mappedGroups[0]?.groupName || '';
        safeUser['groupNames'] = mappedGroups
          .map((g) => g.groupName)
          .filter(Boolean)
          .join(', ');

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
