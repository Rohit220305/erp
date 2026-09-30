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
  ModSettingAddDto,
  ModSettingUpdateDto,
  ModSettingDeleteDto,
  ModSettingDetailsDto,
  ModSettingListDto,
} from './dto/mod-setting.dto';

import { ModSettingService } from './service/mod-setting.service';
import { ModSettingListService } from './service/mod-setting.list.service';

@Controller('mod-setting')
export class ModSettingController {
  constructor(
    private readonly crudService: ModSettingService,
    private readonly listService: ModSettingListService,
  ) {}

  @Post('add-setting')
  async addSetting(
    @AppRequest() req: IAppRequest,
    @Body() body: ModSettingAddDto,
  ) {
    return await this.crudService.startInsertModSetting(req, body);
  }

  @Put('update-setting')
  async updateSetting(
    @AppRequest() req: IAppRequest,
    @Body() body: ModSettingUpdateDto,
  ) {
    return await this.crudService.startUpdateModSetting(req, body);
  }

  @Delete('delete-setting')
  async deleteSetting(
    @AppRequest() req: IAppRequest,
    @Query() query: ModSettingDeleteDto,
  ) {
    return await this.crudService.startDeleteModSetting(req, query);
  }

  @Post('list-setting')
  async listSettings(
    @AppRequest() req: IAppRequest,
    @Body() body: ModSettingListDto,
  ) {
    return await this.listService.startModSettingList(req, body);
  }

  @Get('get-setting')
  async getSettingDetails(
    @AppRequest() req: IAppRequest,
    @Query() query: ModSettingDetailsDto,
  ) {
    return await this.listService.startModSettingDetails(req, query);
  }
}
