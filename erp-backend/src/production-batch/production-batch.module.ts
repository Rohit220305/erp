import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionBatchController } from './production-batch.controller';
import { ProductionBatchService } from './service/production-batch.service';
import { BatchProcessLogService } from './service/batch-process-log.service';
import { ProductionBatchEntity } from './entity/production-batch.entity';
import { ProductionBatchProcessEntity } from './entity/production-batch-process.entity';
import { ProductionBatchItemEntity } from './entity/production-batch-item.entity';
import { BatchProcessLogEntity } from './entity/batch-process-log.entity';
import { BatchProcessLogItemEntity } from './entity/batch-process-log-item.entity';
import { ProductionBatchProcessTimelineEntity } from './entity/production-batch-process-timeline.entity';

import { ProductionOrderEntity } from '../production-order/entity/production-order.entity';
import { MaterialRequestEntity } from '../material-request/entity/material-request.entity';
import { BomEntity } from '../bom/entity/bom.entity';
import { BomProcessItemEntity } from '../bom/entity/bom-process-item.entity';
import { ProcessTemplateMappingEntity } from '../process-template/entity/process.template.mapping.entity';
import { ProcessTemplateEntity } from '../process-template/entity/process.template.entity';
import { ItemEntity } from '../item/entity/item.entity';
import { CompanyEntity } from '../company/entity/company.entity';
import { UserEntity } from '../user/entity/user.entity';
import { AttachmentMasterModule } from '../attachment-master/attachment-master.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';
import { ProductionBatchListService } from './service/production-batch.list.service';
import { ProcessExecutionService } from './service/process-execution.service';
import { BatchItemCategorizerUtility } from './utility/batch-item-categorizer.utility';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionBatchEntity,
      ProductionBatchProcessEntity,
      ProductionBatchItemEntity,
      BatchProcessLogEntity,
      BatchProcessLogItemEntity,
      ProductionBatchProcessTimelineEntity,

      ProductionOrderEntity,
      BomEntity,
      BomProcessItemEntity,
      ProcessTemplateMappingEntity,
      ProcessTemplateEntity,
      ItemEntity,
      CompanyEntity,
      UserEntity,
      MaterialRequestEntity,
    ]),
    AttachmentMasterModule,
    ActivityLogModule,
  ],
  controllers: [ProductionBatchController],
  providers: [
    ProductionBatchService,
    ProductionBatchListService,
    BatchProcessLogService,
    ProcessExecutionService,
    BatchItemCategorizerUtility,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [ProductionBatchService, ProductionBatchListService, ProcessExecutionService, BatchItemCategorizerUtility],
})
export class ProductionBatchModule {}
