"use client";

import CompanyAddForm from "@/components/company/CompanyAddForm";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";

export default function CompanyAddPage() {
  const { setConfig, resetConfig } = useHeader();

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

  return (
    <div className="">
      <CompanyAddForm />
    </div>
  );
}
