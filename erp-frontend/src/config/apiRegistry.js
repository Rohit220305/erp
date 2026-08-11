import { getWorkCentreCategory } from "@/lib/api/work-centre-category-api";
import { getCompany } from "@/lib/api/company-api";
import { getUser } from "@/lib/api/user-api";
import { getCurrency } from "@/lib/api/currency-api";
import { getGroup } from "@/lib/api/group-api";
import { getPackage } from "@/lib/api/package-master-api";
import { getItemUom } from "@/lib/api/item-uom-api";

export const apiRegistry = {
  WorkCentreCategory: { fetchItem: getWorkCentreCategory }, 
  Currency: { fetchItem: getCurrency }, 
  Company: { fetchItem: ({ id }) => getCompany(id) }, 
  "User": { fetchItem: ({ id }) => getUser(id) }, 
  "Group": { fetchItem: ({ id }) => getGroup(id) },
  "PackageMaster": { fetchItem: getPackage },
  "ItemUom": { fetchItem: getItemUom }
};
