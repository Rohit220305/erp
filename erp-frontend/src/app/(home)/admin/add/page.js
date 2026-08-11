"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import UserForm from "@/components/user/UserForm";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

export default function AdminAddPage() {
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
        title: "Add User",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "User Management", href: "/admin" },
          { label: "Add User" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  if (!can(CAPABILITIES.USER.CREATE)) {
    return <AccessDenied missingPermission="USER_CREATE" />;
  }

  return (
    <div className="h-full  ">
      <UserForm mode="create" />
    </div>
  );
}
