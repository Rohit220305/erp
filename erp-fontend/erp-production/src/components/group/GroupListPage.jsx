"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ListingPage from "@/components/listing/ListingPage";
import TableSkeleton from "@/components/common/TableSkeleton";
import { listGroups, deleteGroup } from "@/lib/api/group-api";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";
import GroupListCard from "./GroupListCard";
import GroupGridCard from "./GroupGridCard";
import ConfirmModal from "@/components/common/ConfirmModal";
import toast from "react-hot-toast";

export default function GroupListPage() {
  const { setConfig, resetConfig } = useHeader();
  const { view, page, limit, setTotal, search, setLimit, setPage, total } =
    useListing();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listGroups({ page, limit, search });
      const data = response?.settings?.data || response?.data || {};
      setGroups(data.list || []);
      setTotal(data?.pagination?.total || 0);
      setLimit(data?.pagination?.limit || 10);
    } catch (error) {
      toast.error("Failed to load groups");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, setTotal]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: {
          label: "Add Group",
          onClick: () => router.push("/group/add"),
        },
        icons: ["refresh", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Group Master", href: "/group" },
        ],
      },
    });

    return () => resetConfig();
  }, [setConfig, router]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteGroup(deleteTarget.id);
      if (res?.success === 1) {
        toast.success("Group deleted successfully");
        setDeleteTarget(null);
        fetchGroups();
      } else {
        toast.error(res?.message || "Failed to delete group");
      }
    } catch {
      toast.error("Failed to delete group");
    }
  }, [deleteTarget, fetchGroups]);

  const headers = useMemo(() => [
    { label: "Group Code", key: "groupCode" },
    { label: "Group Name", key: "groupName" },
    { label: "Description", key: "description" },
    { label: "Status", key: "status" },
    { label: "Added Date", key: "addedDateFormatted" },
    
  ], []);

  const renderCell = useCallback((item, key) => {
    if (key === "groupName") {
      return (
        <p
          className="font-medium text-[#1565c0] hover:underline cursor-pointer"
          onClick={() => router.push(`/group/${item.id}`)}
        >
          {item.groupName || "-"}
        </p>
      );
    }
    if (key === "status") {
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          item.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {item.status === "active" ? "Active" : "Inactive"}
        </span>
      );
    }
    if (key === "description") {
      return <span className="text-gray-500 text-sm">{item.description || "-"}</span>;
    }
    
    return item[key] || "-";
  }, [router]);

  if (loading) return <div className="px-6"><TableSkeleton rows={8} cols={6} /></div>;

  return (
    <div className="relative h-full px-6">
      <ListingPage
        view={view}
        data={groups}
        headers={headers}
        renderCell={renderCell}
        renderListCard={(g) => <GroupListCard key={g.id} group={g} />}
        renderGridCard={(g) => <GroupGridCard key={g.id} group={g} />}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Group"
        message={`Are you sure you want to delete "${deleteTarget?.groupName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
