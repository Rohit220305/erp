import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

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
  @RequirePermission(CAPABILITIES.ITEM_CATEGORY.LIST)
  getAllItemCategories(@AppRequest() req: IAppRequest, @Body() body: ItemCategoryListDto) {
    return this.itemCategoryListService.startItemCategoryList(req, body);
  }

  @Get('get-item-category')
  @RequirePermission(CAPABILITIES.ITEM_CATEGORY.VIEW)
  getItemCategoryById(@AppRequest() req: IAppRequest, @Query() query: ItemCategoryDetailsDto) {
    return this.itemCategoryListService.startItemCategoryDetails(req, query);
  }

  @Post('add-item-category')
  @RequirePermission(CAPABILITIES.ITEM_CATEGORY.CREATE)
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
  @RequirePermission(CAPABILITIES.ITEM_CATEGORY.UPDATE)
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
  @RequirePermission(CAPABILITIES.ITEM_CATEGORY.DELETE)
  deleteItemCategory(@AppRequest() req: IAppRequest, @Query() query: ItemCategoryDeleteDto) {
    return this.itemCategoryService.startDeleteItemCategory(req, query);
  }
}
