import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupEntity } from './entity/group.entity';

import { GroupController } from './group.controller';

import { GroupService } from './service/group.service';
import { GroupListService } from './service/group.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  controllers: [GroupController],
  providers: [GroupService, GroupListService, GeneralUtilities],
})
export class GroupModule {}
