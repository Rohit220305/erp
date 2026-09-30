import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrderEntity } from './entity/production-order.entity';
import { BomEntity } from '../bom/entity/bom.entity';
import { BomProcessItemEntity } from '../bom/entity/bom-process-item.entity';
import { ItemEntity } from '../item/entity/item.entity';
import { ItemImageEntity } from '../item/entity/item-image.entity';
import { ProductionBatchEntity } from '../production-batch/entity/production-batch.entity';
import { MaterialRequestEntity } from '../material-request/entity/material-request.entity';
import { ProductionOrderController } from './production-order.controller';
import { ProductionOrderService } from './service/production-order.service';
import { ProductionOrderListService } from './service/production-order.list.service';
import { AttachmentMasterModule } from '../attachment-master/attachment-master.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { GeneralUtilities } from '../package/utilities/general.utilities';
import { CommonFileService } from '../package/service/common-file.service';
import { BomItemCategorizerService } from '../bom/utility/bom-item-categorizer.utility';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrderEntity,
      BomEntity,
      BomProcessItemEntity,
      ItemEntity,
      ItemImageEntity,
      ProductionBatchEntity,
      MaterialRequestEntity,
    ]),
    AttachmentMasterModule,
    ActivityLogModule,
  ],
  controllers: [ProductionOrderController],
  providers: [
    ProductionOrderService,
    ProductionOrderListService,
    GeneralUtilities,
    CommonFileService,
    BomItemCategorizerService,
  ],
  exports: [ProductionOrderService, ProductionOrderListService],
})
export class ProductionOrderModule {}
