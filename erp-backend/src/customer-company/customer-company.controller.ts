import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';

import {
  AddCustomerCompanyDto,
  UpdateCustomerCompanyDto,
  DeleteCustomerCompanyDto,
  CustomerCompanyDetailsDto,
  CustomerCompanyListDto,
  AddCustomerCompanyUserDto,
  UpdateCustomerCompanyUserDto,
  DeleteCustomerCompanyUserDto,
  CustomerCompanyUserDetailsDto,
  CustomerCompanyUserListDto,
} from './dto/customer-company.dto';

import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileService } from 'src/package/service/common-file.service';

import { CustomerCompanyService } from './service/customer-company.service';
import { CustomerCompanyListService } from './service/customer-company.list.service';
import { CustomerCompanyUserService } from './service/customer-company-user.service';
import { CustomerCompanyUserListService } from './service/customer-company-user.list.service';

@Controller('customer-company')
export class CustomerCompanyController {
  constructor(
    private readonly customerCompanyService: CustomerCompanyService,
    private readonly customerCompanyListService: CustomerCompanyListService,
    private readonly customerCompanyUserService: CustomerCompanyUserService,
    private readonly customerCompanyUserListService: CustomerCompanyUserListService,
    private readonly commonFileService: CommonFileService,
  ) { }

  @Post('list-customer-company')
  getAllCustomerCompanies(
    @AppRequest() req: IAppRequest,
    @Body() body: CustomerCompanyListDto,
  ) {
    return this.customerCompanyListService.startCustomerCompanyList(req, body);
  }

  @Get('get-customer-company')
  getCustomerCompanyById(
    @AppRequest() req: IAppRequest,
    @Query() query: CustomerCompanyDetailsDto,
  ) {
    return this.customerCompanyListService.startCustomerCompanyDetails(
      req,
      query,
    );
  }

  @Post('add-customer-company')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }, { name: 'ownerProfileImage', maxCount: 1 }], imageMulterConfig))
  async addCustomerCompany(
    @AppRequest() req: IAppRequest,
    @Body() body: AddCustomerCompanyDto,
    @UploadedFiles() files: any,
  ) {
    console.log('addCustomerCompany body:', body);

    try {
      const params = body;
      const file = files?.logo?.[0];
      const ownerFile = files?.ownerProfileImage?.[0];

      if (file) {
        const fileCheck =
          await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.logo = file.filename;
      }

      if (typeof params.address === 'string') {
        params.address = JSON.parse(params.address);
      }
      
      if (typeof (params as any).owner === 'string') {
        (params as any).owner = JSON.parse((params as any).owner);
      }

      if (ownerFile) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(ownerFile);
        if (!fileCheck.valid) return fileCheck.error;
        if (!(params as any).owner) (params as any).owner = {};
        (params as any).owner.profileImage = ownerFile.filename;
      }

      return await this.customerCompanyService.startInsertCustomerCompany(
        req,
        params,
      );
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-customer-company')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }, { name: 'ownerProfileImage', maxCount: 1 }], imageMulterConfig))
  async updateCustomerCompany(
    @AppRequest() req: IAppRequest,
    @Body() body: UpdateCustomerCompanyDto,
    @UploadedFiles() files: any,
  ) {
    try {
      const params = body;
      const file = files?.logo?.[0];
      const ownerFile = files?.ownerProfileImage?.[0];

      if (file) {
        const fileCheck =
          await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.logo = file.filename;
      }

      if (typeof params.address === 'string') {
        params.address = JSON.parse(params.address);
      }
      
      if (typeof (params as any).owner === 'string') {
        (params as any).owner = JSON.parse((params as any).owner);
      }

      if (ownerFile) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(ownerFile);
        if (!fileCheck.valid) return fileCheck.error;
        if (!(params as any).owner) (params as any).owner = {};
        (params as any).owner.profileImage = ownerFile.filename;
      }

      return await this.customerCompanyService.startUpdateCustomerCompany(
        req,
        params,
      );
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-customer-company')
  deleteCustomerCompany(
    @AppRequest() req: IAppRequest,
    @Query() query: DeleteCustomerCompanyDto,
  ) {
    return this.customerCompanyService.startDeleteCustomerCompany(req, query);
  }

  @Post('list-customer-company-user')
  getAllCustomerCompanyUsers(
    @AppRequest() req: IAppRequest,
    @Body() body: CustomerCompanyUserListDto,
  ) {
    return this.customerCompanyUserListService.startCustomerCompanyUserList(
      req,
      body,
    );
  }

  @Get('get-customer-company-user')
  getCustomerCompanyUserById(
    @AppRequest() req: IAppRequest,
    @Query() query: CustomerCompanyUserDetailsDto,
  ) {
    return this.customerCompanyUserListService.startCustomerCompanyUserDetails(
      req,
      query,
    );
  }

  @Post('add-customer-company-user')
  @UseInterceptors(FileInterceptor('profileImage', imageMulterConfig))
  async addCustomerCompanyUser(
    @AppRequest() req: IAppRequest,
    @Body() body: AddCustomerCompanyUserDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck =
          await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.profileImage = file.filename;
      }

      return await this.customerCompanyUserService.startInsertCustomerCompanyUser(
        req,
        params,
      );
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-customer-company-user')
  @UseInterceptors(FileInterceptor('profileImage', imageMulterConfig))
  async updateCustomerCompanyUser(
    @AppRequest() req: IAppRequest,
    @Body() body: UpdateCustomerCompanyUserDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck =
          await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.profileImage = file.filename;
      }

      return await this.customerCompanyUserService.startUpdateCustomerCompanyUser(
        req,
        params,
      );
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-customer-company-user')
  deleteCustomerCompanyUser(
    @AppRequest() req: IAppRequest,
    @Query() query: DeleteCustomerCompanyUserDto,
  ) {
    return this.customerCompanyUserService.startDeleteCustomerCompanyUser(
      req,
      query,
    );
  }
}
