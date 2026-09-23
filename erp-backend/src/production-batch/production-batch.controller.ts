import { Controller, Get, Post, Body, Delete, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductionBatchService } from './service/production-batch.service';
import { ProductionBatchListService } from './service/production-batch.list.service';
import { BatchProcessLogService } from './service/batch-process-log.service';
import { ProcessExecutionService } from './service/process-execution.service';
import { CommonFileService } from 'src/package/service/common-file.service';
import { documentMulterConfig } from 'src/package/config/multer.config';
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
  ProcessDetailsDto,
  CreateProcessLogDto,
  ProcessExecutionDto,
  MarkBatchCompletedDto,
  CancelProductionBatchDto,
} from './dto/production-batch.dto';

@Controller('production-batch')
export class ProductionBatchController {
  constructor(
    private readonly service: ProductionBatchService,
    private readonly listService: ProductionBatchListService,
    private readonly logService: BatchProcessLogService,
    private readonly processExecutionService: ProcessExecutionService,
    private readonly commonFileService: CommonFileService,
  ) { }

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
  async startDeleteProductionBatch(@AppRequest() req: IAppRequest, @Body() params: ProductionBatchDeleteDto) {
    return await this.service.startDeleteProductionBatch(req, params);
  }

  @Post('cancel-batch')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.DELETE)
  async cancelBatch(@AppRequest() req: IAppRequest, @Body() params: CancelProductionBatchDto) {
    return await this.service.startCancelProductionBatch(req, params);
  }

  @Post('add-process-log')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.UPDATE)
  async addProcessLog(@AppRequest() req: IAppRequest, @Body() params: CreateProcessLogDto) {
    return await this.logService.createLog(req, params);
  }

  @Get('get-process-details')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.VIEW)
  async startProductionBatchProcessDetails(@AppRequest() req: IAppRequest, @Query() query: ProcessDetailsDto) {
    return await this.listService.startProductionBatchProcessDetails(req, query);
  }

  @Post('start-process')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.UPDATE)
  async startProcess(@AppRequest() req: IAppRequest, @Body() params: ProcessExecutionDto) {
    return await this.processExecutionService.startProcess(params, req);
  }

  @Post('pause-process')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.UPDATE)
  async pauseProcess(@AppRequest() req: IAppRequest, @Body() params: ProcessExecutionDto) {
    return await this.processExecutionService.pauseProcess(params, req);
  }

  @Post('resume-process')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.UPDATE)
  async resumeProcess(@AppRequest() req: IAppRequest, @Body() params: ProcessExecutionDto) {
    return await this.processExecutionService.resumeProcess(params, req);
  }

  @Post('finish-process')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.UPDATE)
  async finishProcess(@AppRequest() req: IAppRequest, @Body() params: ProcessExecutionDto) {
    return await this.processExecutionService.finishProcess(params, req);
  }

  @Post('mark-batch-completed')
  @RequirePermission(CAPABILITIES.PRODUCTION_BATCH.UPDATE)
  async markBatchCompleted(@AppRequest() req: IAppRequest, @Body() params: MarkBatchCompletedDto) {
    return await this.processExecutionService.markBatchCompleted(params, req);
  }
}

