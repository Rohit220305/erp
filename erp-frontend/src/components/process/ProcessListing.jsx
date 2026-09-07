"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import processConfig from "@/config/process.config.json";
import {
  listProcesses,
  getProcess,
  deleteProcess,
} from "@/lib/api/process-api";
import ProcessTableRow from "./ProcessTableRow";

export default function ProcessListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedWorkCentreForDetails, setSelectedWorkCentreForDetails] = useState(null);

  const customConfig = {
    ...processConfig,
    forceView: "table",
    headerIcons: processConfig.headerIcons
      ? processConfig.headerIcons.filter((icon) => icon !== "view")
      : (processConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listProcesses}
        fetchItem={getProcess}
        deleteFn={deleteProcess}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <ProcessTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedWorkCentreForDetails={setSelectedWorkCentreForDetails}
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
        open={!!selectedWorkCentreForDetails}
        onClose={() => setSelectedWorkCentreForDetails(null)}
        moduleName="WorkCentre"
        mode="details"
        data={selectedWorkCentreForDetails ? { id: selectedWorkCentreForDetails.workCentreId } : null}
      />
    </>
  );
}

