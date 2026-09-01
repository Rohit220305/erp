import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrderEntity } from './entity/production-order.entity';
import { BomEntity } from '../bom/entity/bom.entity';
import { BomProcessItemEntity } from '../bom/entity/bom-process-item.entity';
import { ItemEntity } from '../item/entity/item.entity';
import { ItemImageEntity } from '../item/entity/item-image.entity';
import { ProductionOrderController } from './production-order.controller';
import { ProductionOrderService } from './service/production-order.service';
import { ProductionOrderListService } from './service/production-order.list.service';
import { AttachmentMasterModule } from '../attachment-master/attachment-master.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { GeneralUtilities } from '../package/utilities/general.utilities';
import { CommonFileService } from '../package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductionOrderEntity,
      BomEntity,
      BomProcessItemEntity,
      ItemEntity,
      ItemImageEntity,
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
  ],
  exports: [ProductionOrderService, ProductionOrderListService],
})
export class ProductionOrderModule {}
