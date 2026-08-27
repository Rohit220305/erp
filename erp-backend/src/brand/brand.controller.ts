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

import {
  BrandAddDto,
  BrandDeleteDto,
  BrandDetailsDto,
  BrandListDto,
  BrandUpdateDto,
} from './dto/brand.dto';

import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileService } from 'src/package/service/common-file.service';

import { BrandService } from './service/brand.service';
import { BrandListService } from './service/brand.list.service';

@Controller('brand')
export class BrandController {
  constructor(
    private brandService: BrandService,
    private brandListService: BrandListService,
    private commonFileService: CommonFileService,
  ) {}

  @Post('list-brand')
  getAllBrands(@AppRequest() req: IAppRequest, @Body() body: BrandListDto) {
    return this.brandListService.startBrandList(req, body);
  }

  @Get('get-brand')
  getBrandById(@AppRequest() req: IAppRequest, @Query() query: BrandDetailsDto) {
    return this.brandListService.startBrandDetails(req, query);
  }

  @Post('add-brand')
  @UseInterceptors(FileInterceptor('brandImage', imageMulterConfig))
  async addBrand(
    @AppRequest() req: IAppRequest,
    @Body() body: BrandAddDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.brandImage = file.filename;
      }

      return await this.brandService.startInsertBrand(req, params);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-brand')
  @UseInterceptors(FileInterceptor('brandImage', imageMulterConfig))
  async updateBrand(
    @AppRequest() req: IAppRequest,
    @Body() body: BrandUpdateDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.brandImage = file.filename;
      }

      return await this.brandService.startUpdateBrand(req, params);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-brand')
  deleteBrand(@AppRequest() req: IAppRequest, @Query() query: BrandDeleteDto) {
    return this.brandService.startDeleteBrand(req, query);
  }
}
