"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import manufacturerConfig from "@/config/manufacturer.config.json";
import {
  listManufacturers,
  getManufacturer,
  deleteManufacturer,
} from "@/lib/api/manufacturer-api";
import SideDrawer from "@/components/common/SideDrawer";
import ManufacturerTableRow from "./ManufacturerTableRow";

export default function ManufacturerListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);

  const customConfig = {
    ...manufacturerConfig,
    forceView: "table",
    headerIcons: manufacturerConfig.headerIcons
      ? manufacturerConfig.headerIcons.filter((icon) => icon !== "view")
      : (manufacturerConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listManufacturers}
        fetchItem={getManufacturer}
        deleteFn={deleteManufacturer}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <ManufacturerTableRow
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
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
    </>
  );
}
