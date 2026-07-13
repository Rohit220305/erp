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
