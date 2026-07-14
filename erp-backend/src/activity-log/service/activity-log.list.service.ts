import { Injectable, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ActivityLogEntity } from '../entity/activity-log.entity';
import { ActivityMasterEntity } from '../entity/activity-master.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { PermissionCacheService } from 'src/auth/permission.cache.service';

@Injectable()
export class ActivityLogListService {
  constructor(
    private readonly general: GeneralUtilities,
    @Inject(forwardRef(() => PermissionCacheService))
    private readonly permissionCacheService: PermissionCacheService,
  ) { }

  @InjectRepository(ActivityLogEntity)
  private readonly activityLogRepository: Repository<ActivityLogEntity>;

  @InjectRepository(ActivityMasterEntity)
  private readonly activityMasterRepository: Repository<ActivityMasterEntity>;

  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;

  async startActivityLogDetails(req, params) {
    const response = await this.getActivityLogDetails(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getActivityLogDetails(req, params) {
    let return_data: any = {};
    try {
      if (!params.id) {
        throw new Error('Activity Log ID is required');
      }

      const log = await this.activityLogRepository.findOne({
        where: { id: params.id },
        relations: { activityMaster: true },
      });

      if (!log) {
        throw new Error('Activity Log not found');
      }

      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin && log.companyId !== req.user.companyId) {
        throw new ForbiddenException('Cannot view activity log outside your company');
      }

      const formattedLog = {
        ...log,
        action: log.activityMaster?.activity || '',
        module: log.activityMaster?.module || '',
        description: log.renderedMessage,
        createdAtFormatted: await this.general.dateFormat(log.createdAt),
      };

      return_data = {
        success: 1,
        message: 'Data found Successfully.',
        data: formattedLog,
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

  async startActivityLogList(req, params) {
    const response = await this.getActivityLogList(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getActivityLogList(req, params) {
    let return_data: any = {};
    try {
      const page = params.page ? parseInt(params.page) : 1;
      const limit = params.limit ? parseInt(params.limit) : 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.activityLogRepository.createQueryBuilder('log');
      queryBuilder.leftJoin(ActivityMasterEntity, 'master', 'log.activityMasterId = master.id');

      // Scoping Check
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      if (!isSuperAdmin) {
        queryBuilder.andWhere('log.companyId = :scopedCompanyId', {
          scopedCompanyId: req.user.companyId,
        });
      }

      if (params?.search) {
        queryBuilder.andWhere(
          `
          (
            log.renderedMessage LIKE :search
            OR log.actorName LIKE :search
            OR log.entityName LIKE :search
          )
          `,
          {
            search: `%${params.search}%`,
          },
        );
      }

      const columnMap: Record<string, string> = {
        id: 'log.id',
        companyId: 'log.companyId',
        actorUserId: 'log.actorUserId',
        impersonatorId: 'log.impersonatorId',
        entityType: 'log.entityType',
        entityId: 'log.entityId',
        actorName: 'log.actorName',
        entityName: 'log.entityName',
        renderedMessage: 'log.renderedMessage',
        description: 'log.renderedMessage',
        ipAddress: 'log.ipAddress',
        userAgent: 'log.userAgent',
        createdAt: 'log.createdAt',
        addedDateFormatted: 'log.createdAt',
        module: 'master.module',
        action: 'master.activity',
        activityCode: 'master.activityCode',
      };

      if (params?.filters) {
        const whereString = await this.general.makeFilterString(
          params.filters,
          columnMap,
          params.logicalOperator,
        );
        if (whereString) {
          queryBuilder.andWhere(whereString);
        }
      }

      if (params?.sortField && params?.sortOrder && columnMap[params.sortField]) {
        const order = params.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(columnMap[params.sortField], order);
      } else {
        queryBuilder.orderBy('log.createdAt', 'DESC');
      }

      queryBuilder.offset(skip);
      queryBuilder.limit(limit);

      const [data, total] = await queryBuilder.getManyAndCount();
      const logList: any[] = [];

      for (const log of data) {
        const master = await this.activityMasterRepository.findOne({ where: { id: log.activityMasterId } });
        const formattedLog = {
          ...log,
          action: master?.activity || '',
          module: master?.module || '',
          description: log.renderedMessage,
          addedDateFormatted: await this.general.dateFormat(log.createdAt),
        };
        logList.push(formattedLog);
      }

      return_data = {
        success: 1,
        message: 'Activity Log List fetched successfully',
        data: {
          list: logList,
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

  async startUserActivityLogs(req, params) {
    const response = await this.getUserActivityLogs(req, params);
    if (response.success === 1) {
      return await this.finishSuccess(response);
    }
    return await this.finishFailure(response);
  }

  async getUserActivityLogs(req, params) {
    let return_data: any = {};
    try {
      const page = params.page ? parseInt(params.page) : 1;
      const limit = params.limit ? parseInt(params.limit) : 20;
      const skip = (page - 1) * limit;
      const userId = params.userId;

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Check access permissions
      const isSuperAdmin = req.user?.isSuperAdmin === 1 || req.user?.isSuperAdmin === true;
      const isSelf = req.user?.sub === userId;

      let hasCapability = false;
      if (!isSuperAdmin && !isSelf) {
        const cachedPermissions = await this.permissionCacheService.getPermissions(req.user.groupId);
        hasCapability = cachedPermissions?.includes('ACTIVITY_LOG_VIEW') ?? false;
      }

      if (!isSuperAdmin && !isSelf && !hasCapability) {
        throw new ForbiddenException('You do not have permission to view these logs.');
      }

      const queryBuilder = this.activityLogRepository.createQueryBuilder('log')
        .leftJoinAndSelect('log.activityMaster', 'master')
        .where('(log.actorUserId = :userId OR log.impersonatorId = :userId OR (log.entityType = :entityType AND log.entityId = :userId))', { userId, entityType: 'USER' });

      if (params.startDate) {
        queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: params.startDate });
      }
      if (params.endDate) {
        queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: params.endDate });
      }

      queryBuilder.orderBy('log.createdAt', 'DESC')
        .offset(skip)
        .limit(limit);

      const [list, total] = await queryBuilder.getManyAndCount();

      const formattedList = await Promise.all(
        list.map(async (log) => ({
          ...log,
          action: log.activityMaster?.activity || '',
          module: log.activityMaster?.module || '',
          description: log.renderedMessage,
          addedDateFormatted: await this.general.dateFormat(log.createdAt),
        })),
      );

      return_data = {
        success: 1,
        message: 'Logs fetched successfully',
        data: {
          list: formattedList,
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
