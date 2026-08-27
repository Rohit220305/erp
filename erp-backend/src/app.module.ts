import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './package/config/db.config';
import { UserModule } from './user/user.module';
import { CompanyModule } from './company/company.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GroupModule } from './group/group.module';
import { AuthModule } from './auth/auth.module';
import { CapabilityModule } from './capability/capability.module';
import { CurrencyModule } from './currency/currency.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { StorageModule } from './storage/storage.module';
import { ItemCategoryModule } from './item-category/item-category.module';
import { PackageModule } from './package-master/package.module';
import { ItemUomModule } from './item-uom/item-uom.module';
import { WorkCentreCategoryModule } from './work-centre-category/work-centre-category.module';
import { ProcessTemplateModule } from './process-template/process-template.module';
import { BrandModule } from './brand/brand.module';
import { WorkCentreModule } from './work-centre/work-centre.module';
import { ProcessModule } from './process/process.module';
import { ItemModule } from './item/item.module';
import { AttachmentMasterModule } from './attachment-master/attachment-master.module';
import { BomModule } from './bom/bom.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    CompanyModule,
    GroupModule,
    AuthModule,
    CapabilityModule,
    CurrencyModule,
    ActivityLogModule,
    ManufacturerModule,
    StorageModule,
    ItemCategoryModule,
    PackageModule,
    ItemUomModule,
    WorkCentreCategoryModule,
    ProcessTemplateModule,
    BrandModule,
    WorkCentreModule,
    ProcessModule,
    ItemModule,
    AttachmentMasterModule,
    BomModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
