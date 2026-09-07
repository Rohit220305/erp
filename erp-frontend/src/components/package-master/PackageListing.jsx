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

import SideDrawer from "@/components/common/SideDrawer";
import { useState } from "react";

export default function PackageListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const customConfig = {
    ...packageMasterConfig,
    forceView: "table",
    headerIcons: packageMasterConfig.headerIcons
      ? packageMasterConfig.headerIcons.filter((icon) => icon !== "view")
      : (packageMasterConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };
  
  return (
    <>
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
        data={selectedUserForDetails ? { id: selectedUserForDetails.userId || selectedUserForDetails.id || selectedUserForDetails.addedBy } : null}
      />
    </>
  );
}
