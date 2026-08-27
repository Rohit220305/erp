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
  WorkCentreAddDto,
  WorkCentreDeleteDto,
  WorkCentreDetailsDto,
  WorkCentreListDto,
  WorkCentreUpdateDto,
} from './dto/work-centre.dto';

import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileService } from 'src/package/service/common-file.service';

import { WorkCentreService } from './service/work-centre.service';
import { WorkCentreListService } from './service/work-centre.list.service';

@Controller('work-centre')
export class WorkCentreController {
  constructor(
    private workCentreService: WorkCentreService,
    private workCentreListService: WorkCentreListService,
    private commonFileService: CommonFileService,
  ) {}

  @Post('list-work-centre')
  getAllWorkCentres(@AppRequest() req: IAppRequest, @Body() body: WorkCentreListDto) {
    return this.workCentreListService.startWorkCentreList(req, body);
  }

  @Get('get-work-centre')
  getWorkCentreById(@AppRequest() req: IAppRequest, @Query() query: WorkCentreDetailsDto) {
    return this.workCentreListService.startWorkCentreDetails(req, query);
  }

  @Post('add-work-centre')
  @UseInterceptors(FileInterceptor('imageUrl', imageMulterConfig))
  async addWorkCentre(
    @AppRequest() req: IAppRequest,
    @Body() body: WorkCentreAddDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.imageUrl = file.filename;
      }

      return await this.workCentreService.startInsertWorkCentre(req, params);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-work-centre')
  @UseInterceptors(FileInterceptor('imageUrl', imageMulterConfig))
  async updateWorkCentre(
    @AppRequest() req: IAppRequest,
    @Body() body: WorkCentreUpdateDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.imageUrl = file.filename;
      }

      return await this.workCentreService.startUpdateWorkCentre(req, params);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-work-centre')
  deleteWorkCentre(@AppRequest() req: IAppRequest, @Query() query: WorkCentreDeleteDto) {
    return this.workCentreService.startDeleteWorkCentre(req, query);
  }
}
