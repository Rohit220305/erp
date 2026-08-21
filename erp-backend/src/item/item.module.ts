import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './entity/item.entity';
import { ItemImageEntity } from './entity/item-image.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { ItemService } from './service/item.service';
import { ItemListService } from './service/item.list.service';
import { GeneralUtilities } from '../package/utilities/general.utilities';
import { CommonFileService } from '../package/service/common-file.service';
import { ItemController } from './item.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemEntity,
      ItemImageEntity,
    ]),
    ActivityLogModule,
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    ItemListService,
    GeneralUtilities,
    CommonFileService,
  ],
})
export class ItemModule {}
