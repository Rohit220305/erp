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
  @RequirePermission('GROUP_VIEW')
  async listGroup(@Req() req, @Body() body: GroupListDto) {
    return await this.groupListService.startGroupList(req, body);
  }
}

