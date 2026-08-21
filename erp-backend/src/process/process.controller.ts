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
import { diskStorage } from 'multer';
import { extname } from 'path';

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

const processMulterConfig = {
  storage: diskStorage({
    destination: process.env.TEMP_DIR || './temp-uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (file.fieldname === 'imageUrl') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Only jpg, jpeg, png and webp files are allowed'), false);
      }
    } else if (file.fieldname === 'instructionPdfUrl') {
      if (file.mimetype === 'application/pdf') {
        callback(null, true);
      } else {
        callback(new Error('Only PDF files are allowed'), false);
      }
    } else {
      callback(null, true);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
};

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
    ], processMulterConfig)
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
    ], processMulterConfig)
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
