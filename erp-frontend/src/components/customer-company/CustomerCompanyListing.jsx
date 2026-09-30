"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import customerCompanyConfig from "@/config/customer-company.config.json";
import {
  listCustomerCompanies,
  getCustomerCompany,
  deleteCustomerCompany,
} from "@/lib/api/customer-company-api";
import CustomerCompanyTableRow from "./CustomerCompanyTableRow";
import CustomerCompanyListCard from "./CustomerCompanyListCard";
import CustomerCompanyGridCard from "./CustomerCompanyGridCard";

export default function CustomerCompanyListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);

  const customConfig = {
    ...customerCompanyConfig,
    headerIcons: customerCompanyConfig.headerIcons
      ? customerCompanyConfig.headerIcons.filter((icon) => icon !== "view")
      : (customerCompanyConfig.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listCustomerCompanies}
        fetchItem={getCustomerCompany}
        deleteFn={deleteCustomerCompany}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <CustomerCompanyTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
        renderListCard={(item, config, onRowAction, setSelectedItemForDetails) => (
          <CustomerCompanyListCard
            key={item.id}
            item={item}
            config={config}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
        renderGridCard={(item, config, onRowAction, setSelectedItemForDetails) => (
          <CustomerCompanyGridCard
            key={item.id}
            item={item}
            config={config}
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
