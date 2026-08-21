import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkCentreEntity } from './entity/work-centre.entity';
import { WorkCentreController } from './work-centre.controller';
import { WorkCentreService } from './service/work-centre.service';
import { WorkCentreListService } from './service/work-centre.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkCentreEntity]),
    ActivityLogModule,
  ],
  controllers: [WorkCentreController],
  providers: [
    WorkCentreService, 
    WorkCentreListService,
    GeneralUtilities,
    CommonFileService,
  ],
})
export class WorkCentreModule {}
