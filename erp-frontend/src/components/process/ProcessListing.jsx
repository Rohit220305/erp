"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import processConfig from "@/config/process.config.json";
import {
  listProcesses,
  getProcess,
  deleteProcess,
} from "@/lib/api/process-api";
import ProcessTableRow from "./ProcessTableRow";

export default function ProcessListing() {
  const customConfig = {
    ...processConfig,
    forceView: "table",
    headerIcons: processConfig.headerIcons
      ? processConfig.headerIcons.filter((icon) => icon !== "view")
      : (processConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listProcesses}
      fetchItem={getProcess}
      deleteFn={deleteProcess}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <ProcessTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
