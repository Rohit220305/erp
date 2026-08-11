import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PackageController } from './package.controller';
import { PackageService } from './service/package.service';
import { PackageListService } from './service/package.list.service';

import { PackageEntity } from './entity/package.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PackageEntity]),
    ActivityLogModule,
  ],
  controllers: [PackageController],
  providers: [
    PackageService,
    PackageListService,
    GeneralUtilities,
  ],
})
export class PackageModule {}
