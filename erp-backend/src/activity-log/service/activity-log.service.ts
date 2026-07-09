import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from '../entity/activity-log.entity';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepository: Repository<ActivityLogEntity>,
  ) {}

  async log(createDto: CreateActivityLogDto): Promise<void> {
    try {
      const logEntry = this.activityLogRepository.create(createDto);
      await this.activityLogRepository.save(logEntry);
    } catch (error) {
      this.logger.error(`Failed to write activity log: ${error.message}`, error.stack);
    }
  }

  async getLogsByUser(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [list, total] = await this.activityLogRepository.findAndCount({
      where: [
        { actorUserId: userId },
        { impersonatorId: userId },
        { module: 'USER', entityId: userId },
        { action: 'IMPERSONATE', entityId: userId },
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { list, total, page, limit };
  }

  async getAllLogs(
    filters: {
      startDate?: string;
      endDate?: string;
      module?: string;
      action?: string;
      actorUserId?: number;
      entityId?: number;
    },
    page: number = 1,
    limit: number = 20,
  ) {
    const query = this.activityLogRepository.createQueryBuilder('log');

    if (filters.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      // Add time to end of day to make date range inclusive
      const endOfDay = `${filters.endDate} 23:59:59`;
      query.andWhere('log.createdAt <= :endDate', { endDate: endOfDay });
    }
    if (filters.module) {
      query.andWhere('log.module = :module', { module: filters.module });
    }
    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }
    if (filters.actorUserId) {
      query.andWhere('log.actorUserId = :actorUserId', { actorUserId: filters.actorUserId });
    }
    if (filters.entityId) {
      query.andWhere('log.entityId = :entityId', { entityId: filters.entityId });
    }

    query.orderBy('log.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [list, total] = await query.getManyAndCount();
    return { list, total, page, limit };
  }
}
