"use client";

import UserForm from "@/components/user/UserForm";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";

export default function AdminAddPage() {
  const { setConfig, resetConfig } = useHeader();

  useEffect(() => {
    setConfig({
      header: { actionButton: null, icons: [], showBookmark: true, showLanguage: true, showProfile: true, showMenu: true },
      navbar: {
        title: "Add User",
        breadcrumbs: [
          { label: "Master" },
          { label: "User Management", href: "/admin" },
          { label: "Add User" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  return (
    <div className="p-6">
      <UserForm mode="create" />
    </div>
  );
}
