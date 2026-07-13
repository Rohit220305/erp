"use client";

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import ChangePasswordForm from "@/components/settings/ChangePasswordForm";

export default function ChangePasswordPage() {
  const { setConfig, resetConfig } = useHeader();

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],
        showBookmark: false,
        showLanguage: false,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Change Password",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Change Password" },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig]);

  return <ChangePasswordForm />;
}
