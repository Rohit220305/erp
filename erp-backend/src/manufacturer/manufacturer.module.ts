import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ManufacturerController } from './manufacturer.controller';
import { ManufacturerService } from './service/manufacturer.service';
import { ManufacturerListService } from './service/manufacturer.list.service';

import { ManufacturerEntity } from './entity/manufacturer.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ManufacturerEntity]),
    ActivityLogModule,
  ],
  controllers: [ManufacturerController],
  providers: [
    ManufacturerService,
    ManufacturerListService,
    GeneralUtilities,
  ],
})
export class ManufacturerModule {}
