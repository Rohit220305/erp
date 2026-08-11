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
  ItemCategoryAddDto,
  ItemCategoryDeleteDto,
  ItemCategoryDetailsDto,
  ItemCategoryListDto,
  ItemCategoryUpdateDto,
} from './dto/item-category.dto';

import { ItemCategoryService } from './service/item-category.service';
import { ItemCategoryListService } from './service/item-category.list.service';

@Controller('item-category')
export class ItemCategoryController {
  constructor(
    private itemCategoryService: ItemCategoryService,
    private itemCategoryListService: ItemCategoryListService,
  ) {}

  @Post('list-item-category')
  getAllItemCategories(@AppRequest() req: IAppRequest, @Body() body: ItemCategoryListDto) {
    return this.itemCategoryListService.startItemCategoryList(req, body);
  }

  @Get('get-item-category')
  getItemCategoryById(@AppRequest() req: IAppRequest, @Query() query: ItemCategoryDetailsDto) {
    return this.itemCategoryListService.startItemCategoryDetails(req, query);
  }

  @Post('add-item-category')
  async addItemCategory(@AppRequest() req: IAppRequest, @Body() body: ItemCategoryAddDto) {
    try {
      return await this.itemCategoryService.startInsertItemCategory(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-item-category')
  async updateItemCategory(@AppRequest() req: IAppRequest, @Body() body: ItemCategoryUpdateDto) {
    try {
      return await this.itemCategoryService.startUpdateItemCategory(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-item-category')
  deleteItemCategory(@AppRequest() req: IAppRequest, @Query() query: ItemCategoryDeleteDto) {
    return this.itemCategoryService.startDeleteItemCategory(req, query);
  }
}
