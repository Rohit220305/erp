"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGroup } from "@/lib/api/group-api";
import GroupDetailPage from "@/components/group/GroupDetailPage";
import Loader from "@/components/common/Loader";
import { useAsyncAction } from "@/hooks/useAsyncAction";

export default function GroupDetailRoute() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const { execute, isLoading: loading } = useAsyncAction();

  useEffect(() => {
    execute(async () => {
      const res = await getGroup(id);
      setGroup(res?.settings?.data || res?.data || res);
    });
  }, [id, execute]);

  if (loading) return <Loader fullPage />;
  if (!group) return <div className="p-6 text-sm text-red-500">Group not found.</div>;

  return <GroupDetailPage group={group} />;
}
