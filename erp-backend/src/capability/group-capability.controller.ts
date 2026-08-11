import { CAPABILITIES } from 'src/package/config/capabilities.config';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import {
  AssignGroupCapabilitiesDto,
  RemoveGroupCapabilityDto,
  GetByGroupDto,
  ListGroupCapabilitiesDto,
} from './dto/capability.dto';

import { GroupCapabilityService } from './service/group-capability.service';
import { GroupCapabilityListService } from './service/group-capability.list.service';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('group-capability')
export class GroupCapabilityController {
  constructor(
    private readonly groupCapabilityService: GroupCapabilityService,
    private readonly groupCapabilityListService: GroupCapabilityListService,
  ) { }

  @Post('assign')
  @RequirePermission(CAPABILITIES.GROUP.UPDATE)
  async assign(@AppRequest() req: IAppRequest, @Body() body: AssignGroupCapabilitiesDto) {
    return await this.groupCapabilityService.startAssignGroupCapabilities(req, body);
  }

  @Delete('remove')
  @RequirePermission(CAPABILITIES.GROUP.UPDATE)
  async remove(@AppRequest() req: IAppRequest, @Body() body: RemoveGroupCapabilityDto) {
    return await this.groupCapabilityService.startRemoveGroupCapability(req, body);
  }

  @Get('get-by-group')
  @RequirePermission(CAPABILITIES.GROUP.VIEW)
  async getByGroup(@Query() query: GetByGroupDto) {
    return await this.groupCapabilityListService.startGetByGroup(query);
  }

  @Post('list-group-capabilities')
  @RequirePermission(CAPABILITIES.GROUP.VIEW)
  async listGroupCapabilities(@AppRequest() req: IAppRequest, @Body() body: ListGroupCapabilitiesDto) {
    return await this.groupCapabilityListService.startListGroupCapabilities(req, body);
  }

  @Get('matrix')
  @RequirePermission(CAPABILITIES.GROUP.VIEW)
  async getMatrix(@Query('groupId') groupId?: string) {
    return await this.groupCapabilityListService.startGetMatrix(groupId ? Number(groupId) : undefined);
  }
}

