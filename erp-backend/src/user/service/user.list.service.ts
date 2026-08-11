import { Injectable, ForbiddenException } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, In } from 'typeorm';

import { UserEntity } from '../entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { UserGroupEntity } from '../entity/user-group.entity';
import { Status } from 'src/package/common/enums/status.enum';

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

      const queryBuilder = this.userRepo.createQueryBuilder('user');

      queryBuilder.select([
        'user.id AS id',
        'user.userName AS userName',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.email AS email',
        'user.status AS status',
        'user.companyId AS companyId',
        'user.profilePhoto AS profilePhoto',
        'user.addedDate AS addedDate',
        'user.updatedDate AS updatedDate',
        'user.lastLoginDate AS lastLoginDate',
        'user.addedBy AS addedBy',
        'user.updatedBy AS updatedBy',
        'user.dialCode AS dialCode',
        'user.phone AS phone',
      ]);

      queryBuilder.addSelect("CONCAT(user.firstName, ' ', user.lastName)", 'fullName');

      queryBuilder.leftJoin(CompanyEntity, 'company', 'company.id = user.companyId');
      queryBuilder.addSelect('company.companyName', 'companyName');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = user.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = user.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.where('user.id = :id', { id: params.id });
      queryBuilder.andWhere('user.sysRecDeleted = 0');

      const user = await queryBuilder.getRawOne();

      if (!user) {
        throw new Error('User not found');
      }

      this.general.assertCompanyAccess(req, user.companyId, 'view', 'user');

      const userGroupsRaw = await this.groupRepo.createQueryBuilder('group')
        .select([
          'group.id AS groupId',
          'group.groupName AS groupName',
          'group.groupCode AS groupCode',
          'user_group.isPrimary AS isPrimary'
        ])
        .innerJoin(UserGroupEntity, 'user_group', 'user_group.groupId = group.id')
        .where('user_group.userId = :userId', { userId: user.id })
        .andWhere('user_group.status = :status', { status: Status.Active })
        .orderBy('user_group.isPrimary', 'DESC')
        .getRawMany();

      const mappedGroups = userGroupsRaw.map((g) => ({
        groupId: g.groupId,
        groupName: g.groupName || '',
        groupCode: g.groupCode || '',
        isPrimary: g.isPrimary === 1 || g.isPrimary === true
      }));

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

      return_data = {
        success: 1,
        data: user,
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
      const { page, limit, skip } = this.general.parsePagination(params);

      const queryBuilder = this.userRepo.createQueryBuilder('user');

      queryBuilder.select([
        'user.id AS id',
        'user.userName AS userName',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.email AS email',
        'user.status AS status',
        'user.companyId AS companyId',
        'user.profilePhoto AS profilePhoto',
        'user.addedDate AS addedDate',
        'user.updatedDate AS updatedDate',
        'user.lastLoginDate AS lastLoginDate',
      ]);

      queryBuilder.addSelect("CONCAT(user.firstName, ' ', user.lastName)", 'fullName');

      queryBuilder.addSelect('company.companyName', 'companyName');
      queryBuilder.addSelect('primaryGroup.groupName', 'groupName');

      queryBuilder.leftJoin('users', 'addedByUser', 'addedByUser.id = user.addedBy');
      queryBuilder.leftJoin('users', 'updatedByUser', 'updatedByUser.id = user.updatedBy');

      queryBuilder.addSelect("CONCAT(addedByUser.firstName, ' ', addedByUser.lastName)", 'addedByName');
      queryBuilder.addSelect("CONCAT(updatedByUser.firstName, ' ', updatedByUser.lastName)", 'updatedByName');

      queryBuilder.andWhere('user.sysRecDeleted = 0');

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

      this.general.applyCompanyScope(queryBuilder, req, 'user');

      let groupFilterIds: number[] = [];
      if (params?.filters && Array.isArray(params.filters)) {
        const remainingFilters: any[] = [];
        for (const f of params.filters) {
          if (f.key === 'groupId' || f.key === 'groupName') {
            if (Array.isArray(f.value)) {
              groupFilterIds = f.value
                .map((v) => Number(v))
                .filter((v) => !isNaN(v) && v > 0);
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

      await this.general.applyListQuery(queryBuilder, params, 'user.firstName');

      const total = await queryBuilder.getCount();
      queryBuilder.offset(skip).limit(limit);

      const data = await queryBuilder.getRawMany();

      const userList: any[] = [];
      const userIds = data.map((u) => u.id);

      let allUserGroups: UserGroupEntity[] = [];
      let allGroups: GroupEntity[] = [];

      if (userIds.length > 0) {
        allUserGroups = await this.userGroupRepo.find({
          where: {
            userId: In(userIds),
            status: Status.Active,
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

      await this.general.formatDate(data);

      for (const safeUser of data) {
        const uUserGroups = allUserGroups.filter(
          (ug) => ug.userId === safeUser.id,
        );
        const mappedGroups = uUserGroups.map((ug) => {
          const g = allGroups.find((grp) => grp.id === ug.groupId);
          return {
            groupId: ug.groupId,
            groupName: g?.groupName || '',
            groupCode: g?.groupCode || '',
            isPrimary: ug.isPrimary === true || (ug.isPrimary as any) === 1,
          };
        });

        safeUser.groups = mappedGroups;
        safeUser.groupNames = mappedGroups
          .map((g) => g.groupName)
          .filter(Boolean)
          .join(', ');

        if (safeUser.lastLoginDate) {
          safeUser.lastLoginDateFormatted = await this.general.dateFormat(
            safeUser.lastLoginDate,
          );
        }

        if (safeUser.profilePhoto) {
          safeUser.photoUrl = await this.general.generateUrl(
            'users',
            `${safeUser.id}`,
            safeUser.profilePhoto,
          );
        }

        userList.push(safeUser);
      }

      const pagination = this.general.buildPaginationResponse(
        total,
        page,
        limit,
        skip,
      );

      return_data = {
        success: 1,
        message: 'User List fetched successfully',
        data: {
          list: userList,
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
    return {
      settings: {
        success: params?.success || 0,
        message: params?.message,
        data: params?.data || [],
      },
    };
  }
}
