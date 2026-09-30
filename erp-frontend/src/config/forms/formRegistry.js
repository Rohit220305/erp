import WorkCentreCategoryDrawerForm from "@/components/work-centre-category/WorkCentreCategoryDrawerForm";
import StorageDrawerForm from "@/components/storage/StorageDrawerForm";
import PackageDrawerForm from "@/components/package-master/PackageDrawerForm";
import ManufacturerDrawerForm from "@/components/manufacturer/ManufacturerDrawerForm";
import ItemUomDrawerForm from "@/components/item-uom/ItemUomDrawerForm";
import ItemCategoryDrawerForm from "@/components/item-category/ItemCategoryDrawerForm";
import BrandDrawerForm from "@/components/brand/BrandDrawerForm";
import WorkCentreDrawerForm from "@/components/work-centre/WorkCentreDrawerForm";
import ProcessDrawerForm from "@/components/process/ProcessDrawerForm";
import ItemDrawerForm from "@/components/item/ItemDrawerForm";

export const formRegistry = {
  "WorkCentreCategory": WorkCentreCategoryDrawerForm,
  "PackageMaster": PackageDrawerForm,
  "Manufacturer": ManufacturerDrawerForm,
  "ItemUom": ItemUomDrawerForm,
  "Storage": StorageDrawerForm,
  "ItemCategory": ItemCategoryDrawerForm,
  "Brand": BrandDrawerForm,
  "WorkCentre": WorkCentreDrawerForm,
  "Process": ProcessDrawerForm,
  "Item": ItemDrawerForm,
};

