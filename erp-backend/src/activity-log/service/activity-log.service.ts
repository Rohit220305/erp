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
  ) { }

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
}
