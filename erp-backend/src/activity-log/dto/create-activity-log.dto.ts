import { IsString } from 'class-validator';
import { IsOptional } from 'class-validator/types/decorator/common/IsOptional';

export class CreateActivityLogDto {
  activityCode: string;
  companyId: number;
  actorUserId: number;
  impersonatorId?: number;
  entityType?: string;
  entityId?: number;
  actorName?: string;
  entityName?: string;
  ipAddress?: string;
  userAgent?: string;
}

