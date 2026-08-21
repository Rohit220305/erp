import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandEntity } from './entity/brand.entity';
import { BrandController } from './brand.controller';
import { BrandService } from './service/brand.service';
import { BrandListService } from './service/brand.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrandEntity]),
    ActivityLogModule,
  ],
  controllers: [BrandController],
  providers: [
    BrandService, 
    BrandListService,
    GeneralUtilities,
    CommonFileService,
  ],
})
export class BrandModule {}
