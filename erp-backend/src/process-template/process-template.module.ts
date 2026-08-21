import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProcessTemplateController } from './process-template.controller';
import { ProcessTemplateService } from './service/process-template.service';
import { ProcessTemplateListService } from './service/process-template.list.service';

import { ProcessTemplateEntity } from './entity/process.template.entity';
import { ProcessTemplateMappingEntity } from './entity/process.template.mapping.entity';
import { ProcessEntity } from '../process/entity/process.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcessTemplateEntity,
      ProcessTemplateMappingEntity,
      ProcessEntity,
    ]),
    ActivityLogModule,
  ],
  controllers: [ProcessTemplateController],
  providers: [
    ProcessTemplateService,
    ProcessTemplateListService,
    GeneralUtilities,
  ],
})
export class ProcessTemplateModule {}
