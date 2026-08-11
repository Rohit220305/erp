import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemCategoryController } from './item-category.controller';
import { ItemCategoryService } from './service/item-category.service';
import { ItemCategoryListService } from './service/item-category.list.service';

import { ItemCategoryEntity } from './entity/item-category.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemCategoryEntity]),
    ActivityLogModule,
  ],
  controllers: [ItemCategoryController],
  providers: [
    ItemCategoryService,
    ItemCategoryListService,
    GeneralUtilities,
  ],
})
export class ItemCategoryModule {}
