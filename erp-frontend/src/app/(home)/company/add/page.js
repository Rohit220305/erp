"use client";

import CompanyAddForm from "@/components/company/CompanyAddForm";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

export default function CompanyAddPage() {
  const { setConfig, resetConfig } = useHeader();
  const { can } = useAuth();

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Add Company",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Company Master", href: "/company" },
          { label: "Add Company" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  if (!can("COMPANY_CREATE")) {
    return <AccessDenied missingPermission="COMPANY_CREATE" />;
  }

  return (
    <div className="h-full">
      <CompanyAddForm />
    </div>
  );
}


  


  

