"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import workCentreConfig from "@/config/work-centre.config.json";
import {
  listWorkCentres,
  getWorkCentre,
  deleteWorkCentre,
} from "@/lib/api/work-centre-api";
import WorkCentreTableRow from "./WorkCentreTableRow";

export default function WorkCentreListing() {
  const customConfig = {
    ...workCentreConfig,
    forceView: "table",
    headerIcons: workCentreConfig.headerIcons
      ? workCentreConfig.headerIcons.filter((icon) => icon !== "view")
      : (workCentreConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listWorkCentres}
      fetchItem={getWorkCentre}
      deleteFn={deleteWorkCentre}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <WorkCentreTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
