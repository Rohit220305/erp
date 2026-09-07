"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import storageConfig from "@/config/storage.config.json";
import {
  listStorages,
  getStorage,
  deleteStorage,
} from "@/lib/api/storage-api";
import StorageTableRow from "./StorageTableRow";

export default function StorageListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);

  const customConfig = {
    ...storageConfig,
    forceView: "table",
    headerIcons: storageConfig.headerIcons
      ? storageConfig.headerIcons.filter((icon) => icon !== "view")
      : (storageConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listStorages}
        fetchItem={getStorage}
        deleteFn={deleteStorage}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <StorageTableRow
            key={item.id}
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
