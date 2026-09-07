import { Controller, Get, Post, Body, Delete, Query } from '@nestjs/common';
import { ProductionBatchService } from './service/production-batch.service';
import { ProductionBatchListService } from './service/production-batch.list.service';
import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import {
  ProductionBatchAddDto,
  ProductionBatchDeleteDto,
  ProductionBatchDetailsDto,
  ProductionBatchListDto,
  ProductionBatchSuggestDto,
} from './dto/production-batch.dto';

@Controller('production-batch')
export class ProductionBatchController {
  constructor(
    private readonly service: ProductionBatchService,
    private readonly listService: ProductionBatchListService,
  ) {}

  @Get('suggest-batch')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.CREATE)
  async startBatchSuggest(@AppRequest() req: IAppRequest, @Query() query: ProductionBatchSuggestDto) {
    return await this.listService.startBatchSuggest(req, query);
  }

  @Post('add-production-batch')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.CREATE)
  async startInsertProductionBatch(@AppRequest() req: IAppRequest, @Body() params: ProductionBatchAddDto) {
    return await this.service.startInsertProductionBatch(req, params);
  }

  @Post('list-production-batch')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.LIST)
  async startProductionBatchList(@AppRequest() req: IAppRequest, @Body() params: ProductionBatchListDto) {
    return await this.listService.startProductionBatchList(req, params);
  }

  @Get('get-production-batch')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.VIEW)
  async startProductionBatchDetails(@AppRequest() req: IAppRequest, @Query() query: ProductionBatchDetailsDto) {
    return await this.listService.startProductionBatchDetails(req, query);
  }

  @Delete('delete-production-batch')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.DELETE)
  async startDeleteProductionBatch(@AppRequest() req: IAppRequest, @Query() params: ProductionBatchDeleteDto) {
    return await this.service.startDeleteProductionBatch(req, params);
  }
}
