import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from './entity/currency.entity';
import { CurrencyService } from './service/currency.service';
import { CurrencyListService } from './service/currency.list.service';
import { CurrencyController } from './currency.controller';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurrencyEntity]),
    ActivityLogModule,
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, CurrencyListService, GeneralUtilities],
  exports: [CurrencyService, CurrencyListService],
})
export class CurrencyModule {}
