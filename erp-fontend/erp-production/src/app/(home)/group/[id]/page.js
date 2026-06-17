"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGroup } from "@/lib/api/group-api";
import GroupDetailPage from "@/components/group/GroupDetailPage";

export default function GroupDetailRoute() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return <GroupDetailPage group={group} />;
}
