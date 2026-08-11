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
  PackageAddDto,
  PackageDeleteDto,
  PackageDetailsDto,
  PackageListDto,
  PackageUpdateDto,
} from './dto/package.dto';

import { PackageService } from './service/package.service';
import { PackageListService } from './service/package.list.service';

@Controller('package')
export class PackageController {
  constructor(
    private packageService: PackageService,
    private packageListService: PackageListService,
  ) { }

  @Post('list-package')
  getAllPackages(@AppRequest() req: IAppRequest, @Body() body: PackageListDto) {
    return this.packageListService.startPackageList(req, body);
  }

  @Get('get-package')
  getPackageById(@AppRequest() req: IAppRequest, @Query() query: PackageDetailsDto) {
    return this.packageListService.startPackageDetails(req, query);
  }

  @Post('add-package')
  async addPackage(@AppRequest() req: IAppRequest, @Body() body: PackageAddDto) {
    try {
      return await this.packageService.startInsertPackage(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-package')
  async updatePackage(@AppRequest() req: IAppRequest, @Body() body: PackageUpdateDto) {
    try {
      return await this.packageService.startUpdatePackage(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-package')
  deletePackage(@AppRequest() req: IAppRequest, @Query() query: PackageDeleteDto) {
    return this.packageService.startDeletePackage(req, query);
  }
}
