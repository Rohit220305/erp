"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import WorkCentreCategoryTableRow from "@/components/work-centre-category/WorkCentreCategoryTableRow";
import workCentreCategoryConfig from "@/config/work-centre-category.config.json";
import {
  listWorkCentreCategories,
  getWorkCentreCategory,
  deleteWorkCentreCategory,
} from "@/lib/api/work-centre-category-api";

export default function WorkCentreCategoryListing() {
  const customConfig = {
    ...workCentreCategoryConfig,
    forceView: "table",
    headerIcons: workCentreCategoryConfig.headerIcons
      ? workCentreCategoryConfig.headerIcons.filter((icon) => icon !== "view")
      : (workCentreCategoryConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };
  
  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listWorkCentreCategories}
      fetchItem={getWorkCentreCategory}
      deleteFn={deleteWorkCentreCategory}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <WorkCentreCategoryTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
