"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import ItemTableRow from "@/components/item/ItemTableRow";
import ItemListCard from "@/components/item/ItemListCard";
import ItemGridCard from "@/components/item/ItemGridCard";
import itemConfig from "@/config/item.config.json";
import { listItems, getItem, deleteItem } from "@/lib/api/item-api";
import SideDrawer from "@/components/common/SideDrawer";

export default function ItemListing() {
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedManufacturerForDetails, setSelectedManufacturerForDetails] = useState(null);
  const [selectedBrandForDetails, setSelectedBrandForDetails] = useState(null);
  const [selectedItemUomForDetails, setSelectedItemUomForDetails] = useState(null);
  const [selectedPackageForDetails, setSelectedPackageForDetails] = useState(null);
  const [selectedStorageForDetails, setSelectedStorageForDetails] = useState(null);

  return (
    <>
      <DynamicListing
        schema={itemConfig}
        fetchData={listItems}
        fetchItem={getItem}
        deleteFn={deleteItem}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <ItemTableRow
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCategoryForDetails={setSelectedCategoryForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedManufacturerForDetails={setSelectedManufacturerForDetails}
            setSelectedBrandForDetails={setSelectedBrandForDetails}
            setSelectedItemUomForDetails={setSelectedItemUomForDetails}
            setSelectedPackageForDetails={setSelectedPackageForDetails}
            setSelectedStorageForDetails={setSelectedStorageForDetails}
          />
        )}
        renderListCard={(item, setSelectedItemForDetails) => (
          <ItemListCard
            key={item.id}
            item={item}
            config={itemConfig}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCategoryForDetails={setSelectedCategoryForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
        renderGridCard={(item, setSelectedItemForDetails) => (
          <ItemGridCard
            key={item.id}
            item={item}
            config={itemConfig}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCategoryForDetails={setSelectedCategoryForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
      />

      <SideDrawer
        open={!!selectedCategoryForDetails}
        onClose={() => setSelectedCategoryForDetails(null)}
        moduleName="ItemCategory"
        mode="details"
        data={selectedCategoryForDetails ? { id: selectedCategoryForDetails.categoryId } : null}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />

      <SideDrawer
        open={!!selectedManufacturerForDetails}
        onClose={() => setSelectedManufacturerForDetails(null)}
        moduleName="Manufacturer"
        mode="details"
        data={selectedManufacturerForDetails ? { id: selectedManufacturerForDetails.manufacturerId } : null}
      />

      <SideDrawer
        open={!!selectedBrandForDetails}
        onClose={() => setSelectedBrandForDetails(null)}
        moduleName="Brand"
        mode="details"
        data={selectedBrandForDetails ? { id: selectedBrandForDetails.brandId } : null}
      />

      <SideDrawer
        open={!!selectedItemUomForDetails}
        onClose={() => setSelectedItemUomForDetails(null)}
        moduleName="ItemUom"
        mode="details"
        data={selectedItemUomForDetails ? { id: selectedItemUomForDetails.itemUomId } : null}
      />

      <SideDrawer
        open={!!selectedPackageForDetails}
        onClose={() => setSelectedPackageForDetails(null)}
        moduleName="PackageMaster"
        mode="details"
        data={selectedPackageForDetails ? { id: selectedPackageForDetails.packageUomId || selectedPackageForDetails.packageId } : null}
      />

      <SideDrawer
        open={!!selectedStorageForDetails}
        onClose={() => setSelectedStorageForDetails(null)}
        moduleName="Storage"
        mode="details"
        data={selectedStorageForDetails ? { id: selectedStorageForDetails.storageId } : null}
      />
    </>
  );
}
