import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { Controller, Get, Post, Body, Query,  UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { ActivityLogListService } from './service/activity-log.list.service';
import { AuthGuard } from '../auth/auth.guard';
import { ActivityLogListDto, ActivityLogDetailsDto, UserActivityLogDto } from './dto/activity-log.dto';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('activity-logs')
@UseGuards(AuthGuard)
export class ActivityLogController {
  constructor(
    private readonly activityLogListService: ActivityLogListService,
  ) {}

  @Get('get-activity-log')
  @RequirePermission(CAPABILITIES.ACTIVITY_LOG.VIEW)
  async getActivityLog(@AppRequest() req: IAppRequest, @Query() query: ActivityLogDetailsDto) {
    return await this.activityLogListService.startActivityLogDetails(req, query);
  }

  @Post('list-activity-log')
  @RequirePermission(CAPABILITIES.ACTIVITY_LOG.VIEW)
  async listActivityLog(@AppRequest() req: IAppRequest, @Body() body: ActivityLogListDto) {
    return await this.activityLogListService.startActivityLogList(req, body);
  }

  @Post('user-logs')
  @RequirePermission(CAPABILITIES.ACTIVITY_LOG.VIEW)
  async getUserActivityLogs(@AppRequest() req: IAppRequest, @Body() body: UserActivityLogDto) {
    return await this.activityLogListService.startUserActivityLogs(req, body);
  }

  @Post('get-logs')
  async getLogs(@AppRequest() req: IAppRequest, @Body() body: UserActivityLogDto) {
    return await this.activityLogListService.startUserActivityLogs(req, body);
  }

  // @Get('all')
  // async getAllLogsLegacy(
  //   @AppRequest() req: IAppRequest,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('startDate') startDate?: string,
  //   @Query('endDate') endDate?: string,
  //   @Query('module') moduleName?: string,
  //   @Query('action') actionName?: string,
  //   @Query('actorUserId') actorUserId?: string,
  //   @Query('entityId') entityId?: string,
  // ) {
  //   const filters: any[] = [];
  //   if (startDate) filters.push({ key: 'createdAt', operator: 'greater than equal', value: startDate });
  //   if (endDate) filters.push({ key: 'createdAt', operator: 'less than equal', value: `${endDate} 23:59:59` });
  //   if (actorUserId) filters.push({ key: 'actorUserId', operator: 'equal', value: parseInt(actorUserId) });
  //   if (entityId) filters.push({ key: 'entityId', operator: 'equal', value: parseInt(entityId) });
  //   if (moduleName) filters.push({ key: 'module', operator: 'equal', value: moduleName });
  //   if (actionName) filters.push({ key: 'action', operator: 'equal', value: actionName });

  //   const result = await this.activityLogListService.getActivityLogList(req, {
  //     page: page ? parseInt(page) : 1,
  //     limit: limit ? parseInt(limit) : 20,
  //     filters: filters.length > 0 ? filters : undefined,
  //   });

  //   if (result.success === 1) {
  //     return {
  //       success: 1,
  //       message: result.message,
  //       data: {
  //         list: result.data.list,
  //         total: result.data.pagination.total,
  //         page: result.data.pagination.page,
  //         limit: result.data.pagination.limit,
  //       },
  //     };
  //   }
  //   return result;
  // }

  @Get(':userId')
  async getLogsLegacy(
    @AppRequest() req: IAppRequest,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.activityLogListService.startUserActivityLogs(req, {
      userId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }
}
