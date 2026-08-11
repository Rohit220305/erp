import { companyDrawerConfig } from './company.drawer.config';
import { userDrawerConfig } from './user.drawer.config';
import { currencyDrawerConfig } from './currency.drawer.config';
import { workCentreCategoryDrawerConfig } from './work-centre-category.drawer.config';
import { PackageMasterDrawerConfig } from './package-master.drawer.config';
import { ManufacturerDrawerConfig } from './manufacturer.drawer.config';
import { itemUomDrawerConfig } from './item-uom.drawer.config';

export const drawerRegistry = {
  "User": userDrawerConfig,
  "Company": companyDrawerConfig,
  "Currency": currencyDrawerConfig,
  "WorkCentreCategory": workCentreCategoryDrawerConfig,
  "PackageMaster": PackageMasterDrawerConfig,
  "Manufacturer": ManufacturerDrawerConfig,
  "ItemUom": itemUomDrawerConfig,
};
