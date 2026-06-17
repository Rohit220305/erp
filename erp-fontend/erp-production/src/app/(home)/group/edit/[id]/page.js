"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGroup } from "@/lib/api/group-api";
import GroupForm from "@/components/group/GroupForm";
import { useHeader } from "@/context/HeaderContext";

export default function GroupEditRoute() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setConfig, resetConfig } = useHeader();

  useEffect(() => {
    setConfig({
      header: { actionButton: null, icons: [], showBookmark: true, showLanguage: true, showProfile: true, showMenu: true },
      navbar: {
        title: "Edit Group",
        breadcrumbs: [
          { label: "Master" },
          { label: "Group Master", href: "/group" },
          { label: "Edit Group" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getGroup(id);
        setGroup(res?.settings?.data || res?.data || res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!group) return <div className="p-6 text-sm text-red-500">Group not found.</div>;

  return (
    <div className="p-6">
      <GroupForm mode="edit" defaultValues={{ ...group }} />
    </div>
  );
}
