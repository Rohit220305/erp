"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUser } from "@/lib/api/user-api";
import UserDetailPage from "@/components/user/UserDetailPage";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import Loader from "@/components/common/Loader";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export default function AdminDetailRoute() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { can, user: currentUser } = useAuth();
  const { execute, isLoading: loading } = useAsyncAction();

  useEffect(() => {
    execute(async () => {
      const res = await getUser(id);
      setUser(res);
    });
  }, [id, execute]);

  if (loading) return <Loader fullPage />;

  const isSelf = currentUser && (String(currentUser.sub) === String(id) || String(currentUser.id) === String(id));
  if (!can(CAPABILITIES.USER.VIEW) && !isSelf) {
    return <AccessDenied missingPermission="USER_VIEW" />;
  }

  if (!user || user.success === 0 || user.settings?.success === 0 || (!user.firstName && !user.userName)) {
    return <AccessDenied missingPermission="USER_VIEW" />;
  }

  return <UserDetailPage user={user} />;
}
