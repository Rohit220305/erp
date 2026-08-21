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
  CompanyAddDto,
  CompanyDeleteDto,
  CompanyDetailsDto,
  CompanyListDto,
  CompanyUpdateDto,
} from './dto/company.dto';
import { UploadedFile, UseInterceptors } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { validate } from 'class-validator';

import { multerConfig } from 'src/package/config/multer.config';

import { CommonFileDto } from 'src/package/dto/common-file.dto';


import { CompanyService } from './service/company.service';
import { CompanyListService } from './service/company.list.service';
import { CommonFileService } from 'src/package/service/common-file.service';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';
import { CAPABILITIES } from 'src/package/config/capabilities.config';

@Controller('company')
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private companyListService: CompanyListService,
    private commonFileService: CommonFileService,
  ) { }

  @Post('list-company')
  @RequirePermission(CAPABILITIES.COMPANY.LIST)
  getAllCompanies(@AppRequest() req: IAppRequest, @Body() body: CompanyListDto) {
    return this.companyListService.startCompanyList(req, body);
  }

  @Get('get-company')
  @RequirePermission(CAPABILITIES.COMPANY.VIEW)
  getCompanyById(@AppRequest() req: IAppRequest, @Query() query: CompanyDetailsDto) {
    return this.companyListService.startCompanyDetails(req, query);
  }

  @Post('add-company')
  @RequirePermission(CAPABILITIES.COMPANY.CREATE)
  @UseInterceptors(FileInterceptor('companyLogo', multerConfig))
  async addCompany(
    @AppRequest() req: IAppRequest,
    @Body() body: CompanyAddDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body; require("fs").appendFileSync("/tmp/company-params.log", "ADD COMPANY PARAMS: " + JSON.stringify(params) + "\n");

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.companyLogo = file.filename;
      }

      return await this.companyService.startInsertCompany(req, params);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-company')
  @RequirePermission(CAPABILITIES.COMPANY.UPDATE)
  @UseInterceptors(FileInterceptor('companyLogo', multerConfig))
  async updateCompany(
    @AppRequest() req: IAppRequest,
    @Body() body: CompanyUpdateDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body; require("fs").appendFileSync("/tmp/company-params.log", "ADD COMPANY PARAMS: " + JSON.stringify(params) + "\n");

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.companyLogo = file.filename;
      }
      return await this.companyService.startUpdateCompany(req, params);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-company')
  @RequirePermission(CAPABILITIES.COMPANY.DELETE)
  deleteCompany(@AppRequest() req: IAppRequest, @Query() query: CompanyDeleteDto) {
    return this.companyService.startDeleteCompany(req, query);
  }
}

