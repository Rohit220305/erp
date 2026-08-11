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
  ManufacturerAddDto,
  ManufacturerDeleteDto,
  ManufacturerDetailsDto,
  ManufacturerListDto,
  ManufacturerUpdateDto,
} from './dto/manufacturer.dto';

import { ManufacturerService } from './service/manufacturer.service';
import { ManufacturerListService } from './service/manufacturer.list.service';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(
    private manufacturerService: ManufacturerService,
    private manufacturerListService: ManufacturerListService,
  ) { }

  @Post('list-manufacturer')
  getAllManufacturers(@AppRequest() req: IAppRequest, @Body() body: ManufacturerListDto) {
    return this.manufacturerListService.startManufacturerList(req, body);
  }

  @Get('get-manufacturer')
  getManufacturerById(@AppRequest() req: IAppRequest, @Query() query: ManufacturerDetailsDto) {
    return this.manufacturerListService.startManufacturerDetails(req, query);
  }

  @Post('add-manufacturer')

  async addManufacturer(@AppRequest() req: IAppRequest, @Body() body: ManufacturerAddDto) {
    try {
      return await this.manufacturerService.startInsertManufacturer(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-manufacturer')
  async updateManufacturer(@AppRequest() req: IAppRequest, @Body() body: ManufacturerUpdateDto) {
    try {
      return await this.manufacturerService.startUpdateManufacturer(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-manufacturer')
  deleteManufacturer(@AppRequest() req: IAppRequest, @Query() query: ManufacturerDeleteDto) {
    return this.manufacturerService.startDeleteManufacturer(req, query);
  }
}
