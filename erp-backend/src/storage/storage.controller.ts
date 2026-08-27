import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { FileInterceptor } from '@nestjs/platform-express';
import { validate } from 'class-validator';

import {
  StorageAddDto,
  StorageDeleteDto,
  StorageDetailsDto,
  StorageListDto,
  StorageUpdateDto,
} from './dto/storage.dto';

import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileDto } from 'src/package/dto/common-file.dto';
import { CommonFileService } from 'src/package/service/common-file.service';

import { StorageService } from './service/storage.service';
import { StorageListService } from './service/storage.list.service';

@Controller('storage')
export class StorageController {
  constructor(
    private storageService: StorageService,
    private storageListService: StorageListService,
    private commonFileService: CommonFileService,
  ) {}

  @Post('list-storage')
  getAllStorages(@AppRequest() req: IAppRequest, @Body() body: StorageListDto) {
    return this.storageListService.startStorageList(req, body);
  }

  @Get('get-storage')
  getStorageById(@AppRequest() req: IAppRequest, @Query() query: StorageDetailsDto) {
    return this.storageListService.startStorageDetails(req, query);
  }

  @Post('add-storage')
  @UseInterceptors(FileInterceptor('storageImage', imageMulterConfig))
  async addStorage(
    @AppRequest() req: IAppRequest,
    @Body() body: StorageAddDto,
    @UploadedFile() file: any,
  ) {
    try {
      
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;

        params.storageImage = file.filename;
      }

      return await this.storageService.startInsertStorage(req, params);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-storage')
  @UseInterceptors(FileInterceptor('storageImage', imageMulterConfig))
  async updateStorage(
    @AppRequest() req: IAppRequest,
    @Body() body: StorageUpdateDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;

        params.storageImage = file.filename;
      }

      return await this.storageService.startUpdateStorage(req, params);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-storage')
  deleteStorage(@AppRequest() req: IAppRequest, @Query() query: StorageDeleteDto) {
    return this.storageService.startDeleteStorage(req, query);
  }
}
