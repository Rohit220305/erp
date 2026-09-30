import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomEntity } from './entity/bom.entity';
import { BomProcessItemEntity } from './entity/bom-process-item.entity';
import { ProcessTemplateEntity } from '../process-template/entity/process.template.entity';
import { ProcessTemplateMappingEntity } from '../process-template/entity/process.template.mapping.entity';
import { ItemEntity } from '../item/entity/item.entity';
import { ItemImageEntity } from '../item/entity/item-image.entity';
import { BomController } from './bom.controller';
import { BomService } from './service/bom.service';
import { BomListService } from './service/bom.list.service';
import { AttachmentMasterModule } from '../attachment-master/attachment-master.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { BomItemCategorizerService } from './utility/bom-item-categorizer.utility';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BomEntity,
      BomProcessItemEntity,
      ProcessTemplateEntity,
      ProcessTemplateMappingEntity,
      ItemEntity,
      ItemImageEntity,
    ]),
    AttachmentMasterModule,
    ActivityLogModule,
  ],
  controllers: [BomController],
  providers: [BomService, BomListService, GeneralUtilities, CommonFileService, BomItemCategorizerService],
  exports: [BomService, BomListService, BomItemCategorizerService],
})
export class BomModule {}

