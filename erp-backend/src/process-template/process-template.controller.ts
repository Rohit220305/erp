import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  
} from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

import {
  ProcessTemplateAddDto,
  ProcessTemplateDeleteDto,
  ProcessTemplateDetailsDto,
  ProcessTemplateListDto,
  ProcessTemplateUpdateDto,
} from './dto/process-template.dto';

import { ProcessTemplateService } from './service/process-template.service';
import { ProcessTemplateListService } from './service/process-template.list.service';

@Controller('process-template')
export class ProcessTemplateController {
  constructor(
    private processTemplateService: ProcessTemplateService,
    private processTemplateListService: ProcessTemplateListService,
  ) { }

  @Post('list-process-template')
  getAllProcessTemplates(@AppRequest() req: IAppRequest, @Body() body: ProcessTemplateListDto) {
    return this.processTemplateListService.startProcessTemplateList(req, body);
  }

  @Get('get-process-template')
  getProcessTemplateById(@AppRequest() req: IAppRequest, @Query() query: ProcessTemplateDetailsDto) {
    return this.processTemplateListService.startProcessTemplateDetails(req, query);
  }

  @Post('add-process-template')
  async addProcessTemplate(@AppRequest() req: IAppRequest, @Body() body: ProcessTemplateAddDto) {
    try {
      return await this.processTemplateService.startInsertProcessTemplate(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-process-template')
  async updateProcessTemplate(@AppRequest() req: IAppRequest, @Body() body: ProcessTemplateUpdateDto) {
    try {
      return await this.processTemplateService.startUpdateProcessTemplate(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-process-template')
  deleteProcessTemplate(@AppRequest() req: IAppRequest, @Query() query: ProcessTemplateDeleteDto) {
    return this.processTemplateService.startDeleteProcessTemplate(req, query);
  }
}
