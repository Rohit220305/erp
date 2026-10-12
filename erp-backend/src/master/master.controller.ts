import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';
import { MasterService } from './service/master.service';
import { MasterListService } from './service/master.list.service';

@Controller('master/:module')
export class MasterController {
  constructor(
    private readonly masterService: MasterService,
    private readonly masterListService: MasterListService,
  ) {}

  @RequirePermission('MASTER_DATA_CREATE')
  @Post('add')
  async addMaster(
    @Param('module') module: string,
    @AppRequest() req: IAppRequest,
    @Body() body: any,
  ) {
    return await this.masterService.startInsertMaster(module, req, body);
  }

  @RequirePermission('MASTER_DATA_UPDATE')
  @Put('update')
  async updateMaster(
    @Param('module') module: string,
    @AppRequest() req: IAppRequest,
    @Body() body: any,
  ) {
    return await this.masterService.startUpdateMaster(module, req, body);
  }

  @RequirePermission('MASTER_DATA_DELETE')
  @Delete('delete')
  async deleteMaster(
    @Param('module') module: string,
    @AppRequest() req: IAppRequest,
    @Query() query: any,
  ) {
    return await this.masterService.startDeleteMaster(module, req, query);
  }

  @RequirePermission('MASTER_DATA_LIST')
  @Post('list')
  async listMaster(
    @Param('module') module: string,
    @AppRequest() req: IAppRequest,
    @Body() body: any,
  ) {
    return await this.masterListService.startGetList(module, req, body);
  }

  @RequirePermission('MASTER_DATA_VIEW')
  @Get('get')
  async getMasterDetails(
    @Param('module') module: string,
    @AppRequest() req: IAppRequest,
    @Query() query: any,
  ) {
    return await this.masterListService.startGetDetails(module, req, query);
  }
}
