import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';

import { UserController } from './user.controller';

import { UserService } from './service/user.service';
import { UserListService } from './service/user.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CompanyEntity, GroupEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    UserListService,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [UserService, UserListService],
})
export class UserModule {}
