"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import ItemCategoryTableRow from "@/components/item-category/ItemCategoryTableRow";
import itemCategoryConfig from "@/config/item-category.config.json";
import {
  listItemCategories,
  getItemCategory,
  deleteItemCategory,
} from "@/lib/api/item-category-api";

export default function ItemCategoryListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedItemCategoryForDetails, setSelectedItemCategoryForDetails] = useState(null);

  const customConfig = {
    ...itemCategoryConfig,
    forceView: "table",
    headerIcons: itemCategoryConfig.headerIcons
      ? itemCategoryConfig.headerIcons.filter((icon) => icon !== "view")
      : (itemCategoryConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };
  
  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listItemCategories}
        fetchItem={getItemCategory}
        deleteFn={deleteItemCategory}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <ItemCategoryTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedItemCategoryForDetails={setSelectedItemCategoryForDetails}
          />
        )}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />

      <SideDrawer
        open={!!selectedItemCategoryForDetails}
        onClose={() => setSelectedItemCategoryForDetails(null)}
        moduleName="ItemCategory"
        mode="details"
        data={selectedItemCategoryForDetails ? { id: selectedItemCategoryForDetails.categoryId } : null}
      />
    </>
  );
}
