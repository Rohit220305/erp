"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import WorkCentreCategoryTableRow from "@/components/work-centre-category/WorkCentreCategoryTableRow";
import workCentreCategoryConfig from "@/config/work-centre-category.config.json";
import {
  listWorkCentreCategories,
  getWorkCentreCategory,
  deleteWorkCentreCategory,
} from "@/lib/api/work-centre-category-api";

export default function WorkCentreCategoryListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const customConfig = {
    ...workCentreCategoryConfig,
    forceView: "table",
    headerIcons: workCentreCategoryConfig.headerIcons
      ? workCentreCategoryConfig.headerIcons.filter((icon) => icon !== "view")
      : (workCentreCategoryConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };
  
  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listWorkCentreCategories}
        fetchItem={getWorkCentreCategory}
        deleteFn={deleteWorkCentreCategory}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <WorkCentreCategoryTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
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
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails ? { id: selectedUserForDetails.userId } : null}
      />
    </>
  );
}
