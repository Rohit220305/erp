import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkCentreCategoryController } from './work-centre-category.controller';
import { WorkCentreCategoryService } from './service/work-centre-category.service';
import { WorkCentreCategoryListService } from './service/work-centre-category.list.service';

import { WorkCentreCategoryEntity } from './entity/work-centre-category.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkCentreCategoryEntity]),
    ActivityLogModule,
  ],
  controllers: [WorkCentreCategoryController],
  providers: [
    WorkCentreCategoryService,
    WorkCentreCategoryListService,
    GeneralUtilities,
  ],
})
export class WorkCentreCategoryModule {}
