"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";

export default function EditCompanyHeader({ company }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();

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
        title: "Edit Company",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Company Master", href: "/company" },
          { label: company.companyName || "Edit" },
        ],
        actionButton: null,
      },
    });
    return () => resetConfig();
  }, [setConfig, router, company.companyName]); 

  return null;
}
