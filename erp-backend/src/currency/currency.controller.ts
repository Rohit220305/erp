import { Body, Controller, Delete, Get, Post, Put, Query, Req } from '@nestjs/common';
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
  ) {}

  @RequirePermission('CURRENCY_CREATE')
  @Post('add-currency')
  async addCurrency(@Req() req, @Body() body: CurrencyAddDto) {
    return await this.currencyService.startAddCurrency(req, body);
  }

  @RequirePermission('CURRENCY_UPDATE')
  @Put('update-currency')
  async updateCurrency(@Req() req, @Body() body: CurrencyUpdateDto) {
    return await this.currencyService.startUpdateCurrency(req, body);
  }

  @RequirePermission('CURRENCY_DELETE')
  @Delete('delete-currency')
  async deleteCurrency(@Req() req, @Query() query: DeleteCurrencyDto) {
    return await this.currencyService.startDeleteCurrency(req, query);
  }

  @RequirePermission('CURRENCY_VIEW')
  @Get('get-currency')
  async getCurrency(@Query() query: GetCurrencyDto) {
    return await this.currencyListService.startCurrencyDetails(query);
  }

  @RequirePermission('CURRENCY_LIST')
  @Post('list-currency')
  async listCurrency(@Req() req, @Body() body: ListCurrencyDto) {
    return await this.currencyListService.startCurrencyList(req, body);
  }
}
