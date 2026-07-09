export class CreateActivityLogDto {
  actorUserId: number;
  impersonatorId?: number;
  action: string;
  module: string;
  entityId?: number;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}
