"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import brandConfig from "@/config/brand.config.json";
import {
  listBrands,
  getBrand,
  deleteBrand,
} from "@/lib/api/brand-api";
import BrandTableRow from "./BrandTableRow";

export default function BrandListing() {
  const customConfig = {
    ...brandConfig,
    forceView: "table",
    headerIcons: brandConfig.headerIcons
      ? brandConfig.headerIcons.filter((icon) => icon !== "view")
      : (brandConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listBrands}
      fetchItem={getBrand}
      deleteFn={deleteBrand}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <BrandTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
