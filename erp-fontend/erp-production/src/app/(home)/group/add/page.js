"use client";

import GroupForm from "@/components/group/GroupForm";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";

export default function GroupAddPage() {
  const { setConfig, resetConfig } = useHeader();

  useEffect(() => {
    setConfig({
      header: { actionButton: null, icons: [], showBookmark: true, showLanguage: true, showProfile: true, showMenu: true },
      navbar: {
        title: "Add Group",
        breadcrumbs: [
          { label: "Master" },
          { label: "Group Master", href: "/group" },
          { label: "Add Group" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  return (
    <div className="p-6">
      <GroupForm mode="create" />
    </div>
  );
}
