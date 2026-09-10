import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionBatchController } from './production-batch.controller';
import { ProductionBatchService } from './service/production-batch.service';
import { ProductionBatchEntity } from './entity/production-batch.entity';
import { ProductionBatchProcessEntity } from './entity/production-batch-process.entity';
import { ProductionBatchItemEntity } from './entity/production-batch-item.entity';
import { BatchConsumptionLogEntity } from './entity/batch-consumption-log.entity';
import { ProductionOrderEntity } from '../production-order/entity/production-order.entity';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionBatchEntity,
      ProductionBatchProcessEntity,
      ProductionBatchItemEntity,
      BatchConsumptionLogEntity,
      ProductionOrderEntity,
      BomEntity,
      BomProcessItemEntity,
      ProcessTemplateMappingEntity,
      ProcessTemplateEntity,
      ItemEntity,
      CompanyEntity,
      UserEntity,
    ]),
    AttachmentMasterModule,
    ActivityLogModule,
  ],
  controllers: [ProductionBatchController],
  providers: [
    ProductionBatchService,
    ProductionBatchListService,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [ProductionBatchService, ProductionBatchListService],
})
export class ProductionBatchModule {}
