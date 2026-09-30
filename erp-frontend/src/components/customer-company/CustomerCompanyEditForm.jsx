"use client";

import { useEffect, useState } from "react";
import CustomerCompanyForm from "./CustomerCompanyForm";
import { updateCustomerCompany, getCustomerCompany } from "@/lib/api/customer-company-api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CustomerCompanyEditForm({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCustomerCompany({ id });
        console.log("Customer Company Edit Response:", res);
        const companyData = res?.settings?.data || res?.data;
        const isSuccess = res?.settings?.success === 1 || res?.success === 1 || res?.settings?.success === "1" || res?.success === "1";
        
        console.log("Is Success:", isSuccess, "Company Data:", companyData);
        if (isSuccess && companyData) {
          setData(companyData);
        } else {
          toast.error("Failed to load customer details");
        }
      } catch (error) {
        console.error("Edit Form Fetch Error:", error);
        toast.error("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50/50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <p>Customer details could not be loaded.</p>
      </div>
    );
  }

  return (
    <CustomerCompanyForm
      key={data.id}
      mode="edit"
      defaultValues={data}
    />
  );
}
