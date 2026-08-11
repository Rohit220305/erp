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
  WorkCentreCategoryAddDto,
  WorkCentreCategoryDeleteDto,
  WorkCentreCategoryDetailsDto,
  WorkCentreCategoryListDto,
  WorkCentreCategoryUpdateDto,
} from './dto/work-centre-category.dto';

import { WorkCentreCategoryService } from './service/work-centre-category.service';
import { WorkCentreCategoryListService } from './service/work-centre-category.list.service';

@Controller('work-centre-category')
export class WorkCentreCategoryController {
  constructor(
    private workCentreCategoryService: WorkCentreCategoryService,
    private workCentreCategoryListService: WorkCentreCategoryListService,
  ) { }

  @Post('list-work-centre-category')
  getAllWorkCentreCategories(@AppRequest() req: IAppRequest, @Body() body: WorkCentreCategoryListDto) {
    return this.workCentreCategoryListService.startWorkCentreCategoryList(req, body);
  }

  @Get('get-work-centre-category')
  getWorkCentreCategoryById(@AppRequest() req: IAppRequest, @Query() query: WorkCentreCategoryDetailsDto) {
    return this.workCentreCategoryListService.startWorkCentreCategoryDetails(req, query);
  }

  @Post('add-work-centre-category')
  async addWorkCentreCategory(@AppRequest() req: IAppRequest, @Body() body: WorkCentreCategoryAddDto) {
    try {
      return await this.workCentreCategoryService.startInsertWorkCentreCategory(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-work-centre-category')
  async updateWorkCentreCategory(@AppRequest() req: IAppRequest, @Body() body: WorkCentreCategoryUpdateDto) {
    try {
      return await this.workCentreCategoryService.startUpdateWorkCentreCategory(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-work-centre-category')
  deleteWorkCentreCategory(@AppRequest() req: IAppRequest, @Query() query: WorkCentreCategoryDeleteDto) {
    return this.workCentreCategoryService.startDeleteWorkCentreCategory(req, query);
  }
}
