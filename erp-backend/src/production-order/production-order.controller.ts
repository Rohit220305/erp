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
  ProductionOrderAddDto,
  ProductionOrderDeleteDto,
  ProductionOrderDetailsDto,
  ProductionOrderListDto,
  ProductionOrderUpdateDto,
} from './dto/production-order.dto';

import { ProductionOrderService } from './service/production-order.service';
import { ProductionOrderListService } from './service/production-order.list.service';

@Controller('production-order')
export class ProductionOrderController {
  constructor(
    private readonly poService: ProductionOrderService,
    private readonly poListService: ProductionOrderListService,
    private readonly commonFileService: CommonFileService,
  ) {}

  @Post('list-production-order')
  @RequirePermission(CAPABILITIES.PRODUCTION_ORDER.LIST)
  getAllOrders(@AppRequest() req: IAppRequest, @Body() body: ProductionOrderListDto) {
    return this.poListService.startProductionOrderList(req, body);
  }

  @Get('get-production-order')
  @RequirePermission(CAPABILITIES.PRODUCTION_ORDER.VIEW)
  getOrderById(@AppRequest() req: IAppRequest, @Query() query: ProductionOrderDetailsDto) {
    return this.poListService.startProductionOrderDetails(req, query);
  }

  @Post('add-production-order')
  @RequirePermission(CAPABILITIES.PRODUCTION_ORDER.CREATE)
  @UseInterceptors(FilesInterceptor('attachments', 10, documentMulterConfig))
  async addOrder(
    @AppRequest() req: IAppRequest,
    @Body() body: ProductionOrderAddDto,
    @UploadedFiles() files: any[],
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
      return await this.poService.startInsertProductionOrder(req, body, validFiles);
    } catch (error: any) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-production-order')
  @RequirePermission(CAPABILITIES.PRODUCTION_ORDER.UPDATE)
  @UseInterceptors(FilesInterceptor('attachments', 10, documentMulterConfig))
  async updateOrder(
    @AppRequest() req: IAppRequest,
    @Body() body: ProductionOrderUpdateDto,
    @UploadedFiles() files: any[],
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
      return await this.poService.startUpdateProductionOrder(req, body, validFiles);
    } catch (error: any) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-production-order')
  @RequirePermission(CAPABILITIES.PRODUCTION_ORDER.DELETE)
  async deleteOrder(@AppRequest() req: IAppRequest, @Query() query: ProductionOrderDeleteDto) {
    try {
      return await this.poService.startDeleteProductionOrder(req, query);
    } catch (error: any) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }
}
