import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommonFileService } from 'src/package/service/common-file.service';
import { documentMulterConfig } from 'src/package/config/multer.config';
import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import {
  BomAddDto,
  BomDeleteDto,
  BomDetailsDto,
  BomListDto,
  BomUpdateDto,
} from './dto/bom.dto';

import { BomService } from './service/bom.service';
import { BomListService } from './service/bom.list.service';



@Controller('bom')
export class BomController {
  constructor(
    private readonly bomService: BomService,
    private readonly bomListService: BomListService,
    private readonly commonFileService: CommonFileService,
  ) {}

  @Post('list-bom')
  @RequirePermission(CAPABILITIES.BOM.LIST)
  getAllBoms(@AppRequest() req: IAppRequest, @Body() body: BomListDto) {
    return this.bomListService.startBomList(req, body);
  }

  @Get('get-bom')
  @RequirePermission(CAPABILITIES.BOM.VIEW)
  getBomById(@AppRequest() req: IAppRequest, @Query() query: BomDetailsDto) {
    return this.bomListService.startBomDetails(req, query);
  }

  @Post('add-bom')
  @RequirePermission(CAPABILITIES.BOM.CREATE)
  @UseInterceptors(FilesInterceptor('attachments', 10, documentMulterConfig))
  async addBom(
    @AppRequest() req: IAppRequest,
    @Body() body: BomAddDto,
    @UploadedFiles() files: any[]
  ) {


    try {
      console.log(body, files);
      const validFiles: any[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileCheck = await this.commonFileService.validateAndCleanUp(file);
          if (!fileCheck.valid) return fileCheck.error;
          validFiles.push(file);
        }
      }
      return await this.bomService.startInsertBom(req, body, validFiles);
    } catch (error: any) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-bom')
  @RequirePermission(CAPABILITIES.BOM.UPDATE)
  @UseInterceptors(FilesInterceptor('attachments', 10, documentMulterConfig))
  async updateBom(
    @AppRequest() req: IAppRequest,
    @Body() body: BomUpdateDto,
    @UploadedFiles() files: any[]
  ) {
    try {
      const validFiles: any[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileCheck = await this.commonFileService.validateAndCleanUp(file);
          if (!fileCheck.valid) return fileCheck.error;
          validFiles.push(file);
        }
      }
      return await this.bomService.startUpdateBom(req, body, validFiles);
    } catch (error: any) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-bom')
  @RequirePermission(CAPABILITIES.BOM.DELETE)
  async deleteBom(@AppRequest() req: IAppRequest, @Query() query: BomDeleteDto) {
    try {
      return await this.bomService.startDeleteBom(req, query);
    } catch (error: any) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }
}
