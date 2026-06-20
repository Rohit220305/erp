import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CapabilityEntity } from './entity/capability.entity';
import { GroupCapabilityEntity } from './entity/group-capability.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { CapabilityController } from './capability.controller';
import { GroupCapabilityController } from './group-capability.controller';

import { CapabilityService } from './service/capability.service';
import { CapabilityListService } from './service/capability.list.service';
import { GroupCapabilityService } from './service/group-capability.service';
import { GroupCapabilityListService } from './service/group-capability.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CapabilityEntity,
      GroupCapabilityEntity,
      GroupEntity,
    ]),
  ],
  controllers: [CapabilityController, GroupCapabilityController],
  providers: [
    CapabilityService,
    CapabilityListService,
    GroupCapabilityService,
    GroupCapabilityListService,
    GeneralUtilities,
  ],
  exports: [
    CapabilityService,
    CapabilityListService,
    GroupCapabilityService,
    GroupCapabilityListService,
  ],
})
export class CapabilityModule {}
