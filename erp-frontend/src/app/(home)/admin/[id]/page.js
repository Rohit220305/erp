"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUser } from "@/lib/api/user-api";
import UserDetailPage from "@/components/user/UserDetailPage";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

export default function AdminDetailRoute() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { can, user: currentUser } = useAuth();

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

  const isSelf = currentUser && (String(currentUser.sub) === String(id) || String(currentUser.id) === String(id));
  if (!can("USER_VIEW") && !isSelf) {
    return <AccessDenied missingPermission="USER_VIEW" />;
  }

  if (!user || user.success === 0 || user.settings?.success === 0 || (!user.firstName && !user.userName)) {
    return <AccessDenied missingPermission="USER_VIEW" />;
  }

  return <UserDetailPage user={user} />;
}
