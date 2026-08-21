"use client";

import { useAuth } from "@/context/AuthContext";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import ItemCategoryTableRow from "@/components/item-category/ItemCategoryTableRow";
import itemCategoryConfig from "@/config/item-category.config.json";
import {
  listItemCategories,
  getItemCategory,
  deleteItemCategory,
} from "@/lib/api/item-category-api";

export default function ItemCategoryListing() {
  const customConfig = {
    ...itemCategoryConfig,
    forceView: "table",
    headerIcons: itemCategoryConfig.headerIcons
      ? itemCategoryConfig.headerIcons.filter((icon) => icon !== "view")
      : (itemCategoryConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };
  
  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listItemCategories}
      fetchItem={getItemCategory}
      deleteFn={deleteItemCategory}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <ItemCategoryTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
