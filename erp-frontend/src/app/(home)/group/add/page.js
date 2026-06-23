"use client";

import GroupForm from "@/components/group/GroupForm";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function GroupAddPage() {
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
        title: "Add Group",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Group Master", href: "/group" },
          { label: "Add Group" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  if (!can("GROUP_CREATE")) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Permission Denied: You do not have the required "GROUP_CREATE" permission to access this page.
      </div>
    );
  }

  return (
    <div className="p-6">
      <GroupForm mode="create" />
    </div>
  );
}

