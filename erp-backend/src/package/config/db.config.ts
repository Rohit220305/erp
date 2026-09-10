import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import { CompanyEntity } from "src/company/entity/company.entity";
import { GroupEntity } from "src/group/entity/group.entity";
import { UserEntity } from "src/user/entity/user.entity";
import { CapabilityEntity } from "src/capability/entity/capability.entity";
import { GroupCapabilityEntity } from "src/capability/entity/group-capability.entity";
import { ActivityLogEntity } from "src/activity-log/entity/activity-log.entity";
import { ActivityMasterEntity } from "src/activity-log/entity/activity-master.entity";
import { CurrencyEntity } from "src/currency/entity/currency.entity";
import { CompanyCurrencyEntity } from "src/company/entity/company-currency.entity";
import { UserGroupEntity } from "src/user/entity/user-group.entity";
import { ManufacturerEntity } from "src/manufacturer/entity/manufacturer.entity";
import { StorageEntity } from "src/storage/entity/storage.entity";
import { ItemCategoryEntity } from "src/item-category/entity/item-category.entity";
import { ItemCategoryStorageMappingEntity } from "src/item-category/entity/item-category-storage.entity";
import { PackageEntity } from "src/package-master/entity/package.entity";
import { ItemUomEntity } from "src/item-uom/entity/item-uom.entity";
import { WorkCentreCategoryEntity } from "src/work-centre-category/entity/work-centre-category.entity";
import { ProcessTemplateEntity } from 'src/process-template/entity/process.template.entity';
import { ProcessTemplateMappingEntity } from 'src/process-template/entity/process.template.mapping.entity';
import { BrandEntity } from "src/brand/entity/brand.entity";
import { WorkCentreEntity } from "src/work-centre/entity/work-centre.entity";
import { ProcessEntity } from "src/process/entity/process.entity";
import { ItemEntity } from 'src/item/entity/item.entity';
import { ItemImageEntity } from 'src/item/entity/item-image.entity';
import { AttachmentMasterEntity } from 'src/attachment-master/entity/attachment-master.entity';
import { BomEntity } from 'src/bom/entity/bom.entity';
import { BomProcessItemEntity } from 'src/bom/entity/bom-process-item.entity';
import { ProductionOrderEntity } from 'src/production-order/entity/production-order.entity';
import { ProductionBatchEntity } from 'src/production-batch/entity/production-batch.entity';
import { ProductionBatchProcessEntity } from 'src/production-batch/entity/production-batch-process.entity';
import { ProductionBatchItemEntity } from 'src/production-batch/entity/production-batch-item.entity';
import { BatchConsumptionLogEntity } from 'src/production-batch/entity/batch-consumption-log.entity';
import { MaterialRequestEntity } from 'src/material-request/entity/material-request.entity';
import { MaterialRequestItemEntity } from 'src/material-request/entity/material-request-item.entity';
dotenv.config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: process.env.DB_CLIENT as 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [
    UserEntity,
    CompanyEntity,
    GroupEntity,
    CapabilityEntity,
    GroupCapabilityEntity,
    ActivityLogEntity,
    ActivityMasterEntity,
    CurrencyEntity,
    CompanyCurrencyEntity,
    UserGroupEntity,
    ManufacturerEntity,
    StorageEntity,
    ItemCategoryEntity,
    ItemCategoryStorageMappingEntity,
    PackageEntity,
    ItemUomEntity,
    WorkCentreCategoryEntity,
    ProcessTemplateEntity,
    ProcessTemplateMappingEntity,
    BrandEntity,
    WorkCentreEntity,
    ProcessEntity,
    ItemEntity,
    ItemImageEntity,
    AttachmentMasterEntity,
    BomEntity,
    BomProcessItemEntity,
    ProductionOrderEntity,
    ProductionBatchEntity,
    ProductionBatchProcessEntity,
    ProductionBatchItemEntity,
    BatchConsumptionLogEntity,
    MaterialRequestEntity,
    MaterialRequestItemEntity,
  ],
  synchronize: false,
  migrationsRun: false,
  logging: false,
  migrations: [__dirname + '/migrations/*.ts'],
};