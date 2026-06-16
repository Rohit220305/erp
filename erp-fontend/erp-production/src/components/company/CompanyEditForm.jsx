"use client";

import CompanyForm from "./CompanyForm";
import { updateCompany } from "@/services/company.service";

export default function CompanyEditForm({ company, parentCompanies = [] }) {
  return (
    <CompanyForm
      mode="edit"
      schema={companyEditSchema}
      defaultValues={company}
      parentCompanies={parentCompanies}
      submitFn={(data) => updateCompany(company.id, data)}
    />
  );
}
