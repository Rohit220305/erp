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
  ItemUomAddDto,
  ItemUomDeleteDto,
  ItemUomDetailsDto,
  ItemUomListDto,
  ItemUomUpdateDto,
} from './dto/item-uom.dto';

import { ItemUomService } from './service/item-uom.service';
import { ItemUomListService } from './service/item-uom.list.service';

@Controller('item-uom')
export class ItemUomController {
  constructor(
    private itemUomService: ItemUomService,
    private itemUomListService: ItemUomListService,
  ) { }

  @Post('list-item-uom')
  getAllItemUoms(@AppRequest() req: IAppRequest, @Body() body: ItemUomListDto) {
    return this.itemUomListService.startItemUomList(req, body);
  }

  @Get('get-item-uom')
  getItemUomById(@AppRequest() req: IAppRequest, @Query() query: ItemUomDetailsDto) {
    return this.itemUomListService.startItemUomDetails(req, query);
  }

  @Post('add-item-uom')
  async addItemUom(@AppRequest() req: IAppRequest, @Body() body: ItemUomAddDto) {
    try {
      return await this.itemUomService.startInsertItemUom(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Put('update-item-uom')
  async updateItemUom(@AppRequest() req: IAppRequest, @Body() body: ItemUomUpdateDto) {
    try {
      return await this.itemUomService.startUpdateItemUom(req, body);
    } catch (error) {
      return {
        success: 0,
        message: error.message,
      };
    }
  }

  @Delete('delete-item-uom')
  deleteItemUom(@AppRequest() req: IAppRequest, @Query() query: ItemUomDeleteDto) {
    return this.itemUomService.startDeleteItemUom(req, query);
  }
}
