"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ListingPage from "@/components/listing/ListingPage";
import TableSkeleton from "@/components/common/TableSkeleton";
import ConfirmModal from "@/components/common/ConfirmModal";
import { listUsers, deleteUser } from "@/lib/api/user-api";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";
import { useAuth } from "@/context/AuthContext";
import UserListCard from "./UserListCard";
import UserGridCard from "./UserGridCard";
import toast from "react-hot-toast";

export default function UserListPage() {
  const { setConfig, resetConfig } = useHeader();
  const { view, page, limit, setTotal, search } = useListing();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listUsers({ page, limit, search });
      const data = response?.settings?.data || response?.data || {};
      setUsers(data.list || []);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, setTotal]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: { label: "Add User", onClick: () => router.push("/admin/add") },
        icons: ["refresh", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master" },
          { label: "User Management", href: "/admin" },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, router]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteUser(deleteTarget.id);
      if (res?.success === 1) {
        toast.success("User deleted successfully");
        setDeleteTarget(null);
        fetchUsers();
      } else {
        toast.error(res?.message || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  }, [deleteTarget, fetchUsers]);

  const headers = useMemo(() => [
    { label: "User", key: "firstName" },
    { label: "Email", key: "email" },
    { label: "Company", key: "companyName" },
    { label: "Group", key: "groupName" },
    { label: "Status", key: "status" },
    { label: "Last Login", key: "lastLoginDateFormatted" },
    { label: "Actions", key: "_actions" },
  ], []);

  const renderCell = useCallback((item, key) => {
    if (key === "firstName") {
      return (
        <div className="flex items-center gap-3">
          {item.photoUrl ? (
            <img src={item.photoUrl} alt={item.firstName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1565c0] flex items-center justify-center font-semibold text-xs border border-blue-200">
              {item.firstName?.[0]}{item.lastName?.[0]}
            </div>
          )}
          <div>
            <p
              className="font-medium text-[#1565c0] hover:underline cursor-pointer text-sm"
              onClick={() => router.push(`/admin/${item.id}`)}
            >
              {item.firstName} {item.lastName}
            </p>
            <p className="text-xs text-gray-400">{item.userName}</p>
          </div>
        </div>
      );
    }
    if (key === "status") {
      return (
        <div className="flex flex-col gap-1">
          <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
            item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {item.status}
          </span>
          {item.isSuperAdmin && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium w-fit">
              Super Admin
            </span>
          )}
        </div>
      );
    }
    if (key === "_actions") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/edit/${item.id}`)}
            className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            Edit
          </button>
          {currentUser?.isSuperAdmin && (
            <button
              onClick={() => setDeleteTarget(item)}
              className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      );
    }
    return item[key] || "-";
  }, [router, currentUser]);

  if (loading) return <div className="px-6"><TableSkeleton rows={8} cols={7} /></div>;

  return (
    <div className="relative h-full px-6">
      <ListingPage
        view={view}
        data={users}
        headers={headers}
        renderCell={renderCell}
        renderListCard={(u) => <UserListCard key={u.id} user={u} />}
        renderGridCard={(u) => <UserGridCard key={u.id} user={u} />}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
