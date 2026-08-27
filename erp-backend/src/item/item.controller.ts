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
import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { imageMulterConfig } from 'src/package/config/multer.config';
import { CommonFileService } from 'src/package/service/common-file.service';

import {
  ItemAddDto,
  ItemDeleteDto,
  ItemDetailsDto,
  ItemListDto,
  ItemUpdateDto,
} from './dto/item.dto';

import { ItemService } from './service/item.service';
import { ItemListService } from './service/item.list.service';

@Controller('item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly itemListService: ItemListService,
    private readonly commonFileService: CommonFileService,
  ) {}

  @Post('list-item')
  @RequirePermission(CAPABILITIES.ITEM.LIST)
  getAllItems(@AppRequest() req: IAppRequest, @Body() body: ItemListDto) {
    return this.itemListService.startItemList(req, body);
  }

  @Get('get-item')
  @RequirePermission(CAPABILITIES.ITEM.VIEW)
  getItemById(@AppRequest() req: IAppRequest, @Query() query: ItemDetailsDto) {
    return this.itemListService.startItemDetails(req, query);
  }

  @Post('add-item')
  @RequirePermission(CAPABILITIES.ITEM.CREATE)
  @UseInterceptors(FilesInterceptor('itemImages', 10, imageMulterConfig))
  async addItem(
    @AppRequest() req: IAppRequest,
    @Body() body: ItemAddDto,
    @UploadedFiles() files: any[],
  ) {
    try {
      const validFiles: any[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileCheck = await this.commonFileService.validateAndCleanUp(file);
          if (!fileCheck.valid) return fileCheck.error;
          validFiles.push(file);
        }
      }
      return await this.itemService.startInsertItem(req, body, validFiles);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Put('update-item')
  @RequirePermission(CAPABILITIES.ITEM.UPDATE)
  @UseInterceptors(FilesInterceptor('itemImages', 5, imageMulterConfig))
  async updateItem(
    @AppRequest() req: IAppRequest,
    @Body() body: ItemUpdateDto,
    @UploadedFiles() files: any[],
  ) {
    try {
      const validFiles: any[] = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const fileCheck = await this.commonFileService.validateAndCleanUp(file);
          if (!fileCheck.valid) return fileCheck.error;
          validFiles.push(file);
        }
      }

      return await this.itemService.startUpdateItem(req, body, validFiles);
    } catch (error) {
      return { success: 0, message: error.message };
    }
  }

  @Delete('delete-item')
  @RequirePermission(CAPABILITIES.ITEM.DELETE)
  deleteItem(@AppRequest() req: IAppRequest, @Query() query: ItemDeleteDto) {
    return this.itemService.startDeleteItem(req, query);
  }
}
