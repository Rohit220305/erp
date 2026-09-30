"use client";

import { use } from "react";
import CustomerCompanyEditForm from "@/components/customer-company/CustomerCompanyEditForm";

export default function CustomerCompanyEditPage({ params }) {
  const unwrappedParams = use(params);
  return <CustomerCompanyEditForm id={unwrappedParams.id} />;
}
