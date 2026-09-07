"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import workCentreConfig from "@/config/work-centre.config.json";
import {
  listWorkCentres,
  getWorkCentre,
  deleteWorkCentre,
} from "@/lib/api/work-centre-api";
import WorkCentreTableRow from "./WorkCentreTableRow";

export default function WorkCentreListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedWorkCentreCategoryForDetails, setSelectedWorkCentreCategoryForDetails] = useState(null);

  const customConfig = {
    ...workCentreConfig,
    forceView: "table",
    headerIcons: workCentreConfig.headerIcons
      ? workCentreConfig.headerIcons.filter((icon) => icon !== "view")
      : (workCentreConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listWorkCentres}
        fetchItem={getWorkCentre}
        deleteFn={deleteWorkCentre}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <WorkCentreTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedWorkCentreCategoryForDetails={setSelectedWorkCentreCategoryForDetails}
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
        open={!!selectedWorkCentreCategoryForDetails}
        onClose={() => setSelectedWorkCentreCategoryForDetails(null)}
        moduleName="WorkCentreCategory"
        mode="details"
        data={selectedWorkCentreCategoryForDetails ? { id: selectedWorkCentreCategoryForDetails.categoryId } : null}
      />
    </>
  );
}
