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
  PlantAddDto,
  PlantDeleteDto,
  PlantDetailsDto,
  PlantListDto,
  PlantUpdateDto,
} from './dto/plant.dto';

import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileService } from 'src/package/service/common-file.service';

import { PlantService } from './service/plant.service';
import { PlantListService } from './service/plant.list.service';

@Controller('plant')
export class PlantController {
  constructor(
    private plantService: PlantService,
    private plantListService: PlantListService,
    private commonFileService: CommonFileService,
  ) {}

  @Post('list-plant')
  getAllPlants(@AppRequest() req: IAppRequest, @Body() body: PlantListDto) {
    return this.plantListService.startPlantList(req, body);
  }

  @Get('get-plant')
  getPlantById(@AppRequest() req: IAppRequest, @Query() query: PlantDetailsDto) {
    return this.plantListService.startPlantDetails(req, query);
  }

  @Post('add-plant')
  @UseInterceptors(FileInterceptor('image', imageMulterConfig))
  async addPlant(
    @AppRequest() req: IAppRequest,
    @Body() body: PlantAddDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.image = file.filename;
      }

      return await this.plantService.startInsertPlant(req, params);
    } catch (error: any) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-plant')
  @UseInterceptors(FileInterceptor('image', imageMulterConfig))
  async updatePlant(
    @AppRequest() req: IAppRequest,
    @Body() body: PlantUpdateDto,
    @UploadedFile() file: any,
  ) {
    try {
      const params = body;

      if (file) {
        const fileCheck = await this.commonFileService.validateAndCleanUp(file);
        if (!fileCheck.valid) return fileCheck.error;
        params.image = file.filename;
      }

      return await this.plantService.startUpdatePlant(req, params);
    } catch (error: any) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-plant')
  deletePlant(@AppRequest() req: IAppRequest, @Query() query: PlantDeleteDto) {
    return this.plantService.startDeletePlant(req, query);
  }
}
