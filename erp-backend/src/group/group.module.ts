import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupEntity } from './entity/group.entity';
import { CapabilityEntity } from 'src/capability/entity/capability.entity';
import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';

import { GroupController } from './group.controller';

import { GroupService } from './service/group.service';
import { GroupListService } from './service/group.list.service';
import { AuthModule } from 'src/auth/auth.module';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEntity, CapabilityEntity, GroupCapabilityEntity]),
    AuthModule,
  ],
  controllers: [GroupController],
  providers: [GroupService, GroupListService, GeneralUtilities],
})
export class GroupModule {}
