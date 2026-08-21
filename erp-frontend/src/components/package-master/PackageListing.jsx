"use client";

import { useAuth } from "@/context/AuthContext";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import PackageTableRow from "@/components/package-master/PackageTableRow";
import packageMasterConfig from "@/config/package-master.config.json";
import {
  listPackages,
  getPackage,
  deletePackage,
} from "@/lib/api/package-master-api";

export default function PackageListing() {
  const customConfig = {
    ...packageMasterConfig,
    forceView: "table",
    headerIcons: packageMasterConfig.headerIcons
      ? packageMasterConfig.headerIcons.filter((icon) => icon !== "view")
      : (packageMasterConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };
  
  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listPackages}
      fetchItem={getPackage}
      deleteFn={deletePackage}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <PackageTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
