"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUser } from "@/lib/api/user-api";
import UserDetailPage from "@/components/user/UserDetailPage";

export default function AdminDetailRoute() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
  if (!user) return <div className="p-6 text-sm text-red-500">User not found.</div>;

  return <UserDetailPage user={user} />;
}
