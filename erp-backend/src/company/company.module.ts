import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './entity/company.entity';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './service/company.service';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { CompanyListService } from './service/company.list.service';
import { CommonFileService } from 'src/package/service/common-file.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity])],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    GeneralUtilities,
    CompanyListService,
    CommonFileService,
  ],
})
export class CompanyModule {}
