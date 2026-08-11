import { CAPABILITIES } from 'src/package/config/capabilities.config';
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import {
  GroupAddDto,
  GroupDeleteDto,
  GroupDetailsDto,
  GroupListDto,
  GroupUpdateDto,
} from './dto/group.dto';
import { SaveGroupWithCapabilitiesDto } from './dto/save-group-with-capabilities.dto';

import { GroupService } from './service/group.service';
import { GroupListService } from './service/group.list.service';
import { Public } from 'src/package/decorator/decorator.public';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupListService: GroupListService,
  ) { }

  @Post('add-group')
  @RequirePermission(CAPABILITIES.GROUP.CREATE)
  async addGroup(@AppRequest() req: IAppRequest, @Body() body: GroupAddDto) {
    return await this.groupService.startInsertGroup(req, body);
  }

  @Put('update-group')
  @RequirePermission(CAPABILITIES.GROUP.UPDATE)
  async updateGroup(@AppRequest() req: IAppRequest, @Body() body: GroupUpdateDto) {
    return await this.groupService.startUpdateGroup(req, body);
  }

  @Delete('delete-group')
  @RequirePermission(CAPABILITIES.GROUP.DELETE)
  async deleteGroup(@AppRequest() req: IAppRequest, @Query() query: GroupDeleteDto) {
    return await this.groupService.startDeleteGroup(req, query);
  }

  @Get('get-group')
  @RequirePermission(CAPABILITIES.GROUP.VIEW)
  async getGroup(@Query() query: GroupDetailsDto) {
    return await this.groupListService.startGroupDetails(query);
  }

  @Post('list-group')
  async listGroup(@AppRequest() req: IAppRequest, @Body() body: GroupListDto) {
    return await this.groupListService.startGroupList(req, body);
  }

  @Post('save-with-capabilities')
  @RequirePermission(CAPABILITIES.GROUP.CREATE)
  async saveWithCapabilities(
    @AppRequest() req: IAppRequest,
    @Body() body: SaveGroupWithCapabilitiesDto,
  ) {
    return await this.groupService.startSaveWithCapabilities(req, body);
  }

  @Put('update-with-capabilities')
  @RequirePermission(CAPABILITIES.GROUP.UPDATE)
  async updateWithCapabilities(
    @AppRequest() req: IAppRequest,
    @Body() body: SaveGroupWithCapabilitiesDto,
  ) {
    return await this.groupService.startSaveWithCapabilities(req, body);
  }
}
