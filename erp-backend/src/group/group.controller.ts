import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

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
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupListService: GroupListService,
  ) {}

  @Post('add-group')
  @RequirePermission('GROUP_CREATE')
  async addGroup(@Req() req, @Body() body: GroupAddDto) {
    return await this.groupService.startInsertGroup(req, body);
  }

  @Put('update-group')
  @RequirePermission('GROUP_UPDATE')
  async updateGroup(@Req() req, @Body() body: GroupUpdateDto) {
    // console.log('Received update-group request with body:', body);
    return await this.groupService.startUpdateGroup(req, body);
  }

  @Delete('delete-group')
  @RequirePermission('GROUP_DELETE')
  async deleteGroup(@Req() req, @Query() query: GroupDeleteDto) {
    return await this.groupService.startDeleteGroup(req, query);
  }

  @Get('get-group')
  @RequirePermission('GROUP_VIEW')
  async getGroup(@Query() query: GroupDetailsDto) {
    return await this.groupListService.startGroupDetails(query);
  }

  @Post('list-group')
  @RequirePermission('GROUP_LIST')
  async listGroup(@Req() req, @Body() body: GroupListDto) {
    return await this.groupListService.startGroupList(req, body);
  }

  @Post('save-with-capabilities')
  @RequirePermission('GROUP_CREATE')
  async saveWithCapabilities(@Req() req, @Body() body: SaveGroupWithCapabilitiesDto) {
    return await this.groupService.startSaveWithCapabilities(req, body);
  }

  @Put('update-with-capabilities')
  @RequirePermission('GROUP_UPDATE')
  async updateWithCapabilities(@Req() req, @Body() body: SaveGroupWithCapabilitiesDto) {
    console.log('Received update-with-capabilities request with body:', body);
    return await this.groupService.startSaveWithCapabilities(req, body);
  }
}

