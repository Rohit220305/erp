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

@Controller('company')
export class CompanyController {
  constructor(    
    private companyService: CompanyService,
    private companyListService: CompanyListService,
    private commonFileService: CommonFileService,
  ) {}

  @Post('list-company')
  @RequirePermission('COMPANY_VIEW')
  getAllCompanies(@Req() req, @Body() body: CompanyListDto) {
    return this.companyListService.startCompanyList(req, body);
  }

  @Get('get-company')
  @RequirePermission('COMPANY_VIEW')
  getCompanyById(@Req() req, @Query() query: CompanyDetailsDto) {
    console.log('Received request to get company details:', query); 
    return this.companyListService.startCompanyDetails(req, query);
  }

  @Post('add-company')
  @RequirePermission('COMPANY_CREATE')
  @UseInterceptors(FileInterceptor('companyLogo', multerConfig))
  async addCompany(
    @Req() req,
    @Body() body: CompanyAddDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileDto = new CommonFileDto();

        fileDto.file = file.mimetype;

        const errors = await validate(fileDto, {
          whitelist: true,
        });

        if (errors.length > 0) {
          await this.commonFileService.deleteTempFile(file.filename);

          return {
            success: 0,
            message: 'Validation failed',
            errors,
          };
        }

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
  @RequirePermission('COMPANY_UPDATE')
  @UseInterceptors(FileInterceptor('companyLogo', multerConfig))
  async updateCompany(
    @Req() req,
    @Body() body: CompanyUpdateDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileDto = new CommonFileDto();

        fileDto.file = file.mimetype;

        const errors = await validate(fileDto, {
          whitelist: true,
        });

        if (errors.length > 0) {
          await this.commonFileService.deleteTempFile(file.filename);

          return {
            success: 0,
            message: 'Validation failed',
            errors,
          };
        }

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
  @RequirePermission('COMPANY_DELETE')
  deleteCompany(@Req() req, @Query() query: CompanyDeleteDto) {
    return this.companyService.startDeleteCompany(req, query);
  }
}

