import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import {
  AssignGroupCapabilitiesDto,
  RemoveGroupCapabilityDto,
  GetByGroupDto,
  ListGroupCapabilitiesDto,
} from './dto/capability.dto';

import { GroupCapabilityService } from './service/group-capability.service';
import { GroupCapabilityListService } from './service/group-capability.list.service';

@Controller('group-capability')
export class GroupCapabilityController {
  constructor(
    private readonly groupCapabilityService: GroupCapabilityService,
    private readonly groupCapabilityListService: GroupCapabilityListService,
  ) {}

  @Post('assign')
  async assign(@Req() req, @Body() body: AssignGroupCapabilitiesDto) {
    return await this.groupCapabilityService.startAssignGroupCapabilities(req, body);
  }

  @Delete('remove')
  async remove(@Req() req, @Body() body: RemoveGroupCapabilityDto) {
    return await this.groupCapabilityService.startRemoveGroupCapability(req, body);
  }

  @Get('get-by-group')
  async getByGroup(@Query() query: GetByGroupDto) {
    return await this.groupCapabilityListService.startGetByGroup(query);
  }

  @Post('list-group-capabilities')
  async listGroupCapabilities(@Req() req, @Body() body: ListGroupCapabilitiesDto) {
    return await this.groupCapabilityListService.startListGroupCapabilities(req, body);
  }
}
