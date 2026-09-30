import { Controller, Get, Post, Body, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { documentMulterConfig } from 'src/package/config/multer.config';
import { CommonFileService } from 'src/package/service/common-file.service';
import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import {
  CancelMaterialRequestDto,
  CreateMaterialRequestDto,
  MarkMaterialRequestDeliveredDto,
  MaterialRequestDetailsDto,
  MaterialRequestListDto,
  MaterialRequestSuggestDto,
} from './dto/material-request.dto';
import { MaterialRequestService } from './service/material-request.service';
import { MaterialRequestListService } from './service/material-request.list.service';

@Controller('material-request')
export class MaterialRequestController {
  constructor(
    private readonly materialRequestService: MaterialRequestService,
    private readonly materialRequestListService: MaterialRequestListService,
    private readonly commonFileService: CommonFileService,
  ) {}

  @Get('get-material-request')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.VIEW)
  async getMaterialRequest(
    @AppRequest() req: IAppRequest,
    @Query() query: MaterialRequestDetailsDto,
  ) {
    return await this.materialRequestListService.startMaterialRequestDetails(req, query);
  }

  @Get('suggest-material-request')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.VIEW)
  async suggestMaterialRequest(
    @AppRequest() req: IAppRequest,
    @Query() query: MaterialRequestSuggestDto,
  ) {
    return await this.materialRequestListService.startMaterialRequestSuggest(req, query);
  }

  @Post('create-material-request')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.CREATE)
  @UseInterceptors(FilesInterceptor('attachments', 10, documentMulterConfig))
  async createMaterialRequest(
    @AppRequest() req: IAppRequest,
    @Body() body: CreateMaterialRequestDto,
    @UploadedFiles() files?: any[],
  ) {
    try {
      const validFiles: any[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileCheck = await this.commonFileService.validateDocumentAndCleanUp(file);
          if (!fileCheck.valid) return fileCheck.error;
          validFiles.push(file);
        }
      }
      return await this.materialRequestService.startCreateMaterialRequest(req, body, validFiles);
    } catch (error: any) {
      return {
        settings: {
          success: 0,
          message: error.message || 'Failed to create material request',
        },
      };
    }
  }

  @Post('list-material-request')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.LIST)
  async listMaterialRequest(
    @AppRequest() req: IAppRequest,
    @Body() body: MaterialRequestListDto,
  ) {
    return await this.materialRequestListService.startMaterialRequestList(req, body);
  }

  @Get('list-material-request')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.LIST)
  async getMaterialRequestList(
    @AppRequest() req: IAppRequest,
    @Query() query: MaterialRequestListDto,
  ) {
    return await this.materialRequestListService.startMaterialRequestList(req, query);
  }

  @Post('mark-material-request-delivered')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.UPDATE)
  async markMaterialRequestDelivered(
    @AppRequest() req: IAppRequest,
    @Body() body: MarkMaterialRequestDeliveredDto,
  ) {
    return await this.materialRequestService.startMarkMaterialRequestDelivered(req, body);
  }

  @Post('cancel-material-request')
  @RequirePermission(CAPABILITIES.MATERIAL_REQUEST.UPDATE)
  async cancelMaterialRequest(
    @AppRequest() req: IAppRequest,
    @Body() body: CancelMaterialRequestDto,
  ) {
    return await this.materialRequestService.startCancelMaterialRequest(req, body);
  }
}
