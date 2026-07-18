"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import CompanyListCard from "@/components/company/CompanyListCard";
import CompanyGridCard from "@/components/company/CompanyGridCard";
import CompanyTableRow from "@/components/company/CompanyTableRow";
import CompanyDetailsDrawer from "@/components/company/CompanyDetailsDrawer";
import companyConfig from "@/config/company.config.json";
import { listCompanies, getCompany, deleteCompany } from "@/lib/api/company-api";

const fetchItem = ({ id }) => getCompany(id);
const deleteFn  = ({ id }) => deleteCompany(id);

export default function CompanyListing() {
  return (
    <DynamicListing
      schema={companyConfig}
      fetchData={listCompanies}
      fetchItem={fetchItem}
      deleteFn={deleteFn}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <CompanyTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
      renderListCard={(item, setSelectedItemForDetails) => (
        <CompanyListCard
          key={item.id}
          item={item}
          config={companyConfig}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
      renderGridCard={(item, setSelectedItemForDetails) => (
        <CompanyGridCard
          key={item.id}
          item={item}
          config={companyConfig}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
      renderDrawer={(open, onClose, item) => (
        <CompanyDetailsDrawer
          open={open}
          onClose={onClose}
          company={item}
        />
      )}
    />
  );
}
