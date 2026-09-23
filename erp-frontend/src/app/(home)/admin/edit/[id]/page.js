"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUser } from "@/lib/api/user-api";
import UserForm from "@/components/user/UserForm";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

export default function AdminEditRoute() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
        title: "Edit User",
        breadcrumbs: [
          { label: "User", },
          { label: "User Management", href: "/admin" },
          { label: "Edit User" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getUser(id);
        setUser(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;

  if (!can(CAPABILITIES.USER.UPDATE)) {
    return <AccessDenied missingPermission="USER_UPDATE" />;
  }

  if (!user) return <div className="p-6 text-sm text-red-500">User not found.</div>;

  return (
    <div className="h-full">
      <UserForm mode="edit" defaultValues={{ ...user }} />
    </div>
  );
}
