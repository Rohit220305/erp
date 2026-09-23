import { companyDrawerConfig } from './company.drawer.config';
import { userDrawerConfig } from './user.drawer.config';
import { currencyDrawerConfig } from './currency.drawer.config';
import { workCentreCategoryDrawerConfig } from './work-centre-category.drawer.config';
import { PackageMasterDrawerConfig } from './package-master.drawer.config';
import { storageDrawerConfig } from './storage.drawer.config';
import { ManufacturerDrawerConfig } from './manufacturer.drawer.config';
import { itemUomDrawerConfig } from './item-uom.drawer.config';
import { itemCategoryDrawerConfig } from './item-category.drawer.config';
import { brandDrawerConfig } from './brand.drawer.config';
import { processDrawerConfig } from './process.drawer.config';
import { workCentreDrawerConfig } from './work-centre.drawer.config';
import { itemDrawerConfig } from './item.drawer.config';
import { processTemplateDrawerConfig } from './process-template.drawer.config';
import { bomDrawerConfig } from './bom.drawer.config';
import { productionOrderDrawerConfig } from './production-order.drawer.config';
import { productionBatchDrawerConfig } from './production-batch.drawer.config';

export const drawerRegistry = {
  "User": userDrawerConfig,
  "Company": companyDrawerConfig,
  "Currency": currencyDrawerConfig,
  "WorkCentreCategory": workCentreCategoryDrawerConfig,
  "PackageMaster": PackageMasterDrawerConfig,
  "Storage": storageDrawerConfig,
  "Manufacturer": ManufacturerDrawerConfig,
  "ItemUom": itemUomDrawerConfig,
  "ItemCategory": itemCategoryDrawerConfig,
  "Brand": brandDrawerConfig,
  "WorkCentre": workCentreDrawerConfig,
  "Process": processDrawerConfig,
  "Item": itemDrawerConfig,
  "ProcessTemplate": processTemplateDrawerConfig,
  "Bom": bomDrawerConfig,
  "ProductionOrder": productionOrderDrawerConfig,
  "ProductionBatch": productionBatchDrawerConfig,
};



