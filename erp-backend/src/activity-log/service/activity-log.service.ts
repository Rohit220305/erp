import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLogEntity } from '../entity/activity-log.entity';
import { ActivityMasterEntity } from '../entity/activity-master.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { CreateActivityLogDto } from '../dto/create-activity-log.dto';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepository: Repository<ActivityLogEntity>,
    @InjectRepository(ActivityMasterEntity)
    private readonly activityMasterRepository: Repository<ActivityMasterEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async log(createDto: CreateActivityLogDto): Promise<void> {
    try {
      const master = await this.activityMasterRepository.findOne({
        where: { activityCode: createDto.activityCode, status: 'Active' },
      });
      if (!master) {
        this.logger.warn(`Failed to write activity log: Activity code '${createDto.activityCode}' not found or inactive.`);
        return;
      }

      let actorName = createDto.actorName;
      if (!actorName) {
        const user = await this.userRepository.findOne({ where: { id: createDto.actorUserId } });
        actorName = user ? `${user.firstName} ${user.lastName}`.trim() : `User #${createDto.actorUserId}`;
      }

      const renderedMessage = master.messageTemplate
        .replace('{actor}', actorName)
        .replace('{entity}', createDto.entityName || '');

      const logEntry = new ActivityLogEntity();
      logEntry.activityMasterId = master.id;
      logEntry.companyId = createDto.companyId;
      logEntry.actorUserId = createDto.actorUserId;
      logEntry.impersonatorId = createDto.impersonatorId || null;
      logEntry.entityType = createDto.entityType || null;
      logEntry.entityId = createDto.entityId || null;
      logEntry.actorName = actorName;
      logEntry.entityName = createDto.entityName || null;
      logEntry.renderedMessage = renderedMessage;
      logEntry.ipAddress = createDto.ipAddress || null;
      logEntry.userAgent = createDto.userAgent || null;

      await this.activityLogRepository.save(logEntry);
    } catch (error) {
      this.logger.error(`Failed to write activity log: ${error.message}`, error.stack);
    }
  }

  async getLogsByUser(userId: number, page: number = 1, limit: number = 20) {
    const [list, total] = await this.activityLogRepository.findAndCount({
      where: [
        { actorUserId: userId },
        { impersonatorId: userId },
        { entityType: 'USER', entityId: userId },
      ],
      relations: { activityMaster: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const mappedList = list.map((log) => ({
      ...log,
      action: log.activityMaster?.activity || '',
      module: log.activityMaster?.module || '',
      description: log.renderedMessage,
    }));

    return { list: mappedList, total, page, limit };
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
    const query = this.activityLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.activityMaster', 'master');

    if (filters.startDate) {
      query.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      const endOfDay = `${filters.endDate} 23:59:59`;
      query.andWhere('log.createdAt <= :endDate', { endDate: endOfDay });
    }
    if (filters.actorUserId) {
      query.andWhere('log.actorUserId = :actorUserId', { actorUserId: filters.actorUserId });
    }
    if (filters.entityId) {
      query.andWhere('log.entityId = :entityId', { entityId: filters.entityId });
    }
    if (filters.module) {
      query.andWhere('master.module = :module', { module: filters.module });
    }
    if (filters.action) {
      query.andWhere('master.activity = :action', { action: filters.action });
    }

    query.orderBy('log.createdAt', 'DESC');
    query.skip((page - 1) * limit);
    query.take(limit);

    const [list, total] = await query.getManyAndCount();

    const mappedList = list.map((log) => ({
      ...log,
      action: log.activityMaster?.activity || '',
      module: log.activityMaster?.module || '',
      description: log.renderedMessage,
    }));

    return { list: mappedList, total, page, limit };
  }
}
