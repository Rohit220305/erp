"use client";

import { useState, useEffect } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import brandConfig from "@/config/brand.config.json";
import {
  listBrands,
  getBrand,
  deleteBrand,
} from "@/lib/api/brand-api";
import { listCompanies } from "@/lib/api/company-api";
import { listManufacturers } from "@/lib/api/manufacturer-api";
import BrandTableRow from "./BrandTableRow";

export default function BrandListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedManufacturerForDetails, setSelectedManufacturerForDetails] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);

  useEffect(() => {
    // Fetch data for dynamic options
    const fetchOptions = async () => {
      try {
        const [companiesRes, manufacturersRes] = await Promise.all([
          listCompanies({ page: 1, limit: 100 }),
          listManufacturers({ page: 1, limit: 100 })
        ]);
        
        const comps = companiesRes?.settings?.data?.list || companiesRes?.data?.list || [];
        const manus = manufacturersRes?.settings?.data?.list || manufacturersRes?.data?.list || [];

        setCompanies(comps.map(c => ({ label: c.companyName || c.name, value: c.id })));
        setManufacturers(manus.map(m => ({ label: m.manufacturerName || m.name, value: m.id })));
      } catch (error) {
        console.error("Error fetching dynamic options", error);
      }
    };
    fetchOptions();
  }, []);

  const customConfig = {
    ...brandConfig,
    forceView: "table",
    headerIcons: brandConfig.headerIcons
      ? brandConfig.headerIcons.filter((icon) => icon !== "view")
      : (brandConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  // Inject fetched options into searchFields and sidebarFields
  if (customConfig.searchFields) {
    customConfig.searchFields = customConfig.searchFields.map(field => {
      if (field.dynamicOptions === "companies") return { ...field, options: companies };
      if (field.dynamicOptions === "manufacturers") return { ...field, options: manufacturers };
      return field;
    });
  }

  if (customConfig.sidebarFields) {
    customConfig.sidebarFields = customConfig.sidebarFields.map(field => {
      if (field.dynamicOptions === "companies") return { ...field, options: companies };
      if (field.dynamicOptions === "manufacturers") return { ...field, options: manufacturers };
      return field;
    });
  }

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
