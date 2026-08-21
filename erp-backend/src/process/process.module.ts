import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcessEntity } from './entity/process.entity';
import { ProcessController } from './process.controller';
import { ProcessService } from './service/process.service';
import { ProcessListService } from './service/process.list.service';


import { ActivityLogModule } from 'src/activity-log/activity-log.module';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessEntity]),
    ActivityLogModule,
  ],
  controllers: [ProcessController],
  providers: [
    ProcessService, 
    ProcessListService,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [ProcessService, ProcessListService],
})
export class ProcessModule {}
