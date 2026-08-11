import { CAPABILITIES } from 'src/package/config/capabilities.config';
import { Body, Controller, Delete, Get, Post, Put, Query,  } from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { CurrencyService } from './service/currency.service';
import { CurrencyListService } from './service/currency.list.service';
import {
  CurrencyAddDto,
  CurrencyUpdateDto,
  DeleteCurrencyDto,
  GetCurrencyDto,
  ListCurrencyDto,
} from './dto/currency.dto';
import { RequirePermission } from 'src/package/decorator/require-permission.decorator';

@Controller('currency')
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly currencyListService: CurrencyListService,
  ) { }

  @Post('add-currency')
  @RequirePermission(CAPABILITIES.CURRENCY.CREATE)
  async addCurrency(@AppRequest() req: IAppRequest, @Body() body: CurrencyAddDto) {
    return await this.currencyService.startAddCurrency(req, body);
  }

  @Put('update-currency')
  @RequirePermission(CAPABILITIES.CURRENCY.UPDATE)
  async updateCurrency(@AppRequest() req: IAppRequest, @Body() body: CurrencyUpdateDto) {
    return await this.currencyService.startUpdateCurrency(req, body);
  }

  @Delete('delete-currency')
  @RequirePermission(CAPABILITIES.CURRENCY.DELETE)
  async deleteCurrency(@AppRequest() req: IAppRequest, @Query() query: DeleteCurrencyDto) {
    return await this.currencyService.startDeleteCurrency(req, query);
  }

  @Get('get-currency')
  @RequirePermission(CAPABILITIES.CURRENCY.VIEW)
  async getCurrency(@AppRequest() req: IAppRequest, @Query() query: GetCurrencyDto) {
    return await this.currencyListService.startCurrencyDetails(req, query);
  }

  @Post('list-currency')
  @RequirePermission(CAPABILITIES.CURRENCY.LIST)
  async listCurrency(@AppRequest() req: IAppRequest, @Body() body: ListCurrencyDto) {
    return await this.currencyListService.startCurrencyList(req, body);
  }
}
