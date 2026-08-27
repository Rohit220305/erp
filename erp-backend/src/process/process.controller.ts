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
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { documentMulterConfig } from 'src/package/config/multer.config';

import {
  ProcessAddDto,
  ProcessDeleteDto,
  ProcessDetailsDto,
  ProcessListDto,
  ProcessUpdateDto,
} from './dto/process.dto';

import { CommonFileService } from 'src/package/service/common-file.service';
import { ProcessService } from './service/process.service';
import { ProcessListService } from './service/process.list.service';



@Controller('process')
export class ProcessController {
  constructor(
    private processService: ProcessService,
    private processListService: ProcessListService,
    private commonFileService: CommonFileService,
  ) {}

  @Post('list-process')
  getAllProcesses(@AppRequest() req: IAppRequest, @Body() body: ProcessListDto) {
    return this.processListService.startProcessList(req, body);
  }

  @Get('get-process')
  getProcessById(@AppRequest() req: IAppRequest, @Query() query: ProcessDetailsDto) {
    return this.processListService.startProcessDetails(req, query);
  }

  @Post('add-process')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageUrl', maxCount: 1 },
      { name: 'instructionPdfUrl', maxCount: 1 },
    ], documentMulterConfig)
  )
  async addProcess(
    @AppRequest() req: IAppRequest,
    @Body() body: ProcessAddDto,
    @UploadedFiles() files: { imageUrl?: any[]; instructionPdfUrl?: any[] },
  ) {
    try {
      const params = body;

      if (files?.imageUrl?.length) {
        params.imageUrl = files.imageUrl[0].filename;
      }
      if (files?.instructionPdfUrl?.length) {
        params.instructionPdfUrl = files.instructionPdfUrl[0].filename;
      }

      return await this.processService.startInsertProcess(req, params);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-process')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageUrl', maxCount: 1 },
      { name: 'instructionPdfUrl', maxCount: 1 },
    ], documentMulterConfig)
  )
  async updateProcess(
    @AppRequest() req: IAppRequest,
    @Body() body: ProcessUpdateDto,
    @UploadedFiles() files: { imageUrl?: any[]; instructionPdfUrl?: any[] },
  ) {
    try {
      const params = body;

      if (files?.imageUrl?.length) {
        params.imageUrl = files.imageUrl[0].filename;
      }
      if (files?.instructionPdfUrl?.length) {
        params.instructionPdfUrl = files.instructionPdfUrl[0].filename;
      }

      return await this.processService.startUpdateProcess(req, params);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-process')
  deleteProcess(@AppRequest() req: IAppRequest, @Query() query: ProcessDeleteDto) {
    return this.processService.startDeleteProcess(req, query);
  }
}
