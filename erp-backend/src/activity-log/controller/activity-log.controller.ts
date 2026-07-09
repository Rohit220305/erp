import { Controller, Get, Param, Query, UseGuards, Req, ForbiddenException, ParseIntPipe, Inject, forwardRef } from '@nestjs/common';
import { ActivityLogService } from '../service/activity-log.service';
import { AuthGuard } from '../../auth/auth.guard'; // Assuming AuthGuard is here
import { PermissionCacheService } from '../../auth/permission.cache.service';

@Controller('activity-logs')
@UseGuards(AuthGuard)
export class ActivityLogController {
  constructor(
    private readonly activityLogService: ActivityLogService,
    @Inject(forwardRef(() => PermissionCacheService))
    private readonly permissionCacheService: PermissionCacheService,
  ) {}

  @Get('all')
  async getAllLogs(
    @Req() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('module') moduleName?: string,
    @Query('action') actionName?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('entityId') entityId?: string,
  ) {
    const currentUser = req.user;
    const isSuperAdmin = currentUser.isSuperAdmin === 1 || currentUser.isSuperAdmin === true;

    if (!isSuperAdmin) {
      throw new ForbiddenException('Only Super Admins can view all activity logs.');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const actorUserIdNum = actorUserId ? parseInt(actorUserId, 10) : undefined;
    const entityIdNum = entityId ? parseInt(entityId, 10) : undefined;

    const result = await this.activityLogService.getAllLogs(
      {
        startDate,
        endDate,
        module: moduleName,
        action: actionName,
        actorUserId: actorUserIdNum,
        entityId: entityIdNum,
      },
      pageNum,
      limitNum,
    );

    return {
      success: 1,
      message: 'All logs fetched successfully',
      data: result,
    };
  }

  @Get(':userId')
  async getLogs(
    @Req() req,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const currentUser = req.user;
    
    // Check permissions
    const isSuperAdmin = currentUser.isSuperAdmin === 1 || currentUser.isSuperAdmin === true;
    const isSelf = currentUser.sub === userId;
    
    let hasCapability = false;
    if (!isSuperAdmin && !isSelf) {
      const cachedPermissions = await this.permissionCacheService.getPermissions(currentUser.groupId);
      hasCapability = cachedPermissions?.includes('ACTIVITY_LOG_VIEW') ?? false;
    }

    if (!isSuperAdmin && !isSelf && !hasCapability) {
      throw new ForbiddenException('You do not have permission to view these logs.');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await this.activityLogService.getLogsByUser(userId, pageNum, limitNum);
    
    return {
      success: 1,
      message: 'Logs fetched successfully',
      data: result,
    };
  }
}
