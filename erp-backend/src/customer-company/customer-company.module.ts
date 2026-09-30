import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CustomerCompanyEntity } from './entity/customer-company.entity';
import { AddressEntity } from './entity/address.entity';
import { CustomerCompanyUserEntity } from './entity/customer-company-user.entity';

import { CustomerCompanyController } from './customer-company.controller';
import { CustomerCompanyService } from './service/customer-company.service';
import { CustomerCompanyListService } from './service/customer-company.list.service';
import { CustomerCompanyUserService } from './service/customer-company-user.service';
import { CustomerCompanyUserListService } from './service/customer-company-user.list.service';

import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerCompanyEntity,
      AddressEntity,
      CustomerCompanyUserEntity,
    ]),
    ActivityLogModule,
  ],
  controllers: [CustomerCompanyController],
  providers: [
    CustomerCompanyService,
    CustomerCompanyListService,
    CustomerCompanyUserService,
    CustomerCompanyUserListService,
    GeneralUtilities,
    CommonFileService,
  ],
  exports: [
    CustomerCompanyService,
    CustomerCompanyListService,
    CustomerCompanyUserService,
    CustomerCompanyUserListService,
  ],
})
export class CustomerCompanyModule {}
