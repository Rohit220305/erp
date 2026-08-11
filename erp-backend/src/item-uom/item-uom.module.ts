import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemUomController } from './item-uom.controller';
import { ItemUomService } from './service/item-uom.service';
import { ItemUomListService } from './service/item-uom.list.service';

import { ItemUomEntity } from './entity/item-uom.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemUomEntity]),
    ActivityLogModule,
  ],
  controllers: [ItemUomController],
  providers: [
    ItemUomService,
    ItemUomListService,
    GeneralUtilities,
  ],
})
export class ItemUomModule {}
