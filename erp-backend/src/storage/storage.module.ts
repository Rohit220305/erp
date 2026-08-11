import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageController } from './storage.controller';
import { StorageService } from './service/storage.service';
import { StorageListService } from './service/storage.list.service';

import { StorageEntity } from './entity/storage.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StorageEntity]),
    ActivityLogModule,
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    StorageListService,
    GeneralUtilities,
    CommonFileService,
  ],
})
export class StorageModule {}
