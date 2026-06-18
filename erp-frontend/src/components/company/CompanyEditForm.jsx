// CompanyEditForm.jsx
"use client";

import CompanyForm from "./CompanyForm";
import { updateCompany } from "@/lib/api/company-api";

export default function CompanyEditForm({ company, parentCompanies = [] }) {
  return (
    <CompanyForm
      mode="edit"
      defaultValues={company}
      parentCompanies={parentCompanies}
      submitFn={(data, logoFile) =>
        updateCompany({ ...data, id: company.id }, logoFile)
      }
    />
  );
}
