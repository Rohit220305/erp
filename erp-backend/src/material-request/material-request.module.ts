import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { AttachmentMasterModule } from '../attachment-master/attachment-master.module';
import { CompanyEntity } from '../company/entity/company.entity';
import { ItemEntity } from '../item/entity/item.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ProductionBatchItemEntity } from '../production-batch/entity/production-batch-item.entity';
import { ProductionBatchProcessEntity } from '../production-batch/entity/production-batch-process.entity';
import { ProductionBatchEntity } from '../production-batch/entity/production-batch.entity';
import { UserEntity } from '../user/entity/user.entity';
import { MaterialRequestItemEntity } from './entity/material-request-item.entity';
import { MaterialRequestEntity } from './entity/material-request.entity';
import { MaterialRequestController } from './material-request.controller';
import { MaterialRequestListService } from './service/material-request.list.service';
import { MaterialRequestService } from './service/material-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MaterialRequestEntity,
      MaterialRequestItemEntity,
      ProductionBatchEntity,
      ProductionBatchItemEntity,
      ProductionBatchProcessEntity,
      CompanyEntity,
      ItemEntity,
      UserEntity,
    ]),
    ActivityLogModule,
    AttachmentMasterModule,
  ],
  controllers: [MaterialRequestController],
  providers: [
    MaterialRequestService,
    MaterialRequestListService,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [MaterialRequestService, MaterialRequestListService],
})
export class MaterialRequestModule {}
