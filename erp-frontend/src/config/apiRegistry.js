import { getWorkCentreCategory } from "@/lib/api/work-centre-category-api";
import { getCompany } from "@/lib/api/company-api";
import { getUser } from "@/lib/api/user-api";
import { getCurrency } from "@/lib/api/currency-api";
import { getGroup } from "@/lib/api/group-api";
import { getPackage } from "@/lib/api/package-master-api";
import { getItemUom } from "@/lib/api/item-uom-api";
import { getStorage } from "@/lib/api/storage-api";
import { getItemCategory } from "@/lib/api/item-category-api";
import { getBrand } from "@/lib/api/brand-api";
import { getWorkCentre } from "@/lib/api/work-centre-api";
import { getProcess } from "@/lib/api/process-api";
import { getItem } from "@/lib/api/item-api";
import { getManufacturer } from "@/lib/api/manufacturer-api";
import { getProcessTemplate } from "@/lib/api/process-template-api";
import { getBom } from "@/lib/api/bom-api";
import { getProductionOrder } from "@/lib/api/production-order-api";
import { getProductionBatchDetails } from "@/lib/api/production-batch-api";
import { getMaterialRequest } from "@/lib/api/material-request-api";
import { getCustomerCompany } from "@/lib/api/customer-company-api";

export const apiRegistry = {
  WorkCentreCategory: { fetchItem: getWorkCentreCategory }, 
  Currency: { fetchItem: getCurrency }, 
  Company: { fetchItem: ({ id }) => getCompany(id) }, 
  "User": { fetchItem: ({ id }) => getUser(id) }, 
  "Group": { fetchItem: ({ id }) => getGroup(id) },
  "PackageMaster": { fetchItem: getPackage },
  "ItemUom": { fetchItem: getItemUom },
  "Storage": { fetchItem: getStorage },
  "ItemCategory": { fetchItem: getItemCategory },
  "Brand": { fetchItem: getBrand },
  "WorkCentre": { fetchItem: getWorkCentre },
  "Process": { fetchItem: getProcess },
  "Item": { fetchItem: getItem },
  "Manufacturer": { fetchItem: getManufacturer },
  "ProcessTemplate": { fetchItem: getProcessTemplate },
  "Bom": { fetchItem: getBom },
  "ProductionOrder": { fetchItem: getProductionOrder },
  "ProductionBatch": { fetchItem: getProductionBatchDetails },
  "MaterialRequest": { fetchItem: getMaterialRequest },
  "CustomerCompany": { fetchItem: getCustomerCompany },
};


