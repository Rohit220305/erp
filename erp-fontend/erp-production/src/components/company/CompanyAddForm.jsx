// CompanyAddForm.jsx
"use client";

import { companyAddSchema } from "@/lib/validation/company-add-update.schema";
import CompanyForm from "./CompanyForm";
import { createCompany } from "@/lib/api/company-api";

export default function CompanyAddForm({ parentCompanies = [] }) {
  return (
    <CompanyForm
      mode="create"
      parentCompanies={parentCompanies}
      submitFn={createCompany}
    />
  );
}
