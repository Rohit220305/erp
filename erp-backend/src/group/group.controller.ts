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

@Controller('group')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupListService: GroupListService,
  ) {}

  @Post('add-group')
  async addGroup(@Req() req, @Body() body: GroupAddDto) {
    return await this.groupService.startInsertGroup(req, body);
  }

  @Put('update-group')
  async updateGroup(@Req() req, @Body() body: GroupUpdateDto) {
    return await this.groupService.startUpdateGroup(req, body);
  }

  @Delete('delete-group')
  async deleteGroup(@Req() req, @Query() query: GroupDeleteDto) {
    return await this.groupService.startDeleteGroup(req, query);
  }

  @Get('get-group')
  async getGroup(@Query() query: GroupDetailsDto) {
    return await this.groupListService.startGroupDetails(query);
  }

  @Post('list-group')
  async listGroup(@Req() req, @Body() body: GroupListDto) {
    return await this.groupListService.startGroupList(req, body);
  }
}
