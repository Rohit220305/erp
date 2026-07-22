"use client";

import CompanyForm from "./CompanyForm";
import { createCompany } from "@/lib/api/company-api";

export default function CompanyAddForm() {
  return (
    <CompanyForm
      mode="create"
      submitFn={(data, logoFile) => createCompany(data, logoFile)}
    />
  );
}
