// CompanyEditForm.jsx
"use client";

import CompanyForm from "./CompanyForm";
import { updateCompany } from "@/lib/api/company-api";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

export default function CompanyEditForm({ company, parentCompanies = [] }) {
  const { can } = useAuth();

  if (!can("COMPANY_UPDATE")) {
    return <AccessDenied missingPermission="COMPANY_UPDATE" />;
  }

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
