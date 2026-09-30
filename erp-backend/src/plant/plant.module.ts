import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantEntity } from './entity/plant.entity';
import { PlantController } from './plant.controller';
import { PlantService } from './service/plant.service';
import { PlantListService } from './service/plant.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlantEntity]),
    ActivityLogModule,
  ],
  controllers: [PlantController],
  providers: [
    PlantService,
    PlantListService,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [PlantService, PlantListService],
})
export class PlantModule {}
