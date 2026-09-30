"use client";

import CustomerCompanyForm from "./CustomerCompanyForm";
import { createCustomerCompany } from "@/lib/api/customer-company-api";

export default function CustomerCompanyAddForm() {
  return (
    <CustomerCompanyForm mode="create" />
  );
}
