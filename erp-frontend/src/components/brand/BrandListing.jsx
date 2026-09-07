"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import brandConfig from "@/config/brand.config.json";
import {
  listBrands,
  getBrand,
  deleteBrand,
} from "@/lib/api/brand-api";
import BrandTableRow from "./BrandTableRow";

export default function BrandListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedManufacturerForDetails, setSelectedManufacturerForDetails] = useState(null);

  const customConfig = {
    ...brandConfig,
    forceView: "table",
    headerIcons: brandConfig.headerIcons
      ? brandConfig.headerIcons.filter((icon) => icon !== "view")
      : (brandConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listBrands}
        fetchItem={getBrand}
        deleteFn={deleteBrand}
        renderTableRow={(brand, onRowAction, setSelectedBrandForDetails) => (
          <BrandTableRow
            key={brand.id}
            brand={brand}
            onRowAction={onRowAction}
            setSelectedBrandForDetails={setSelectedBrandForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedManufacturerForDetails={setSelectedManufacturerForDetails}
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
        open={!!selectedManufacturerForDetails}
        onClose={() => setSelectedManufacturerForDetails(null)}
        moduleName="Manufacturer"
        mode="details"
        data={selectedManufacturerForDetails ? { id: selectedManufacturerForDetails.manufacturerId } : null}
      />
    </>
  );
}
