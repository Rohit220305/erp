"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ListingPage from "@/components/listing/ListingPage";
import TableSkeleton from "@/components/common/TableSkeleton";
import ConfirmModal from "@/components/common/ConfirmModal";
import { listUsers, deleteUser } from "@/lib/api/user-api";
import { listCompanies } from "@/lib/api/company-api";
import { listGroups } from "@/lib/api/group-api";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";
import { useAuth } from "@/context/AuthContext";
import UserListCard from "./UserListCard";
import UserGridCard from "./UserGridCard";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import toast from "react-hot-toast";

export default function UserListPage() {
  const { setConfig, resetConfig } = useHeader();
  const { view, page, limit, setTotal, search, setLimit, setPage, total } =
    useListing();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();

  // Dynamic dropdown options
  const [companyOptions, setCompanyOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const compRes = await listCompanies({ page: 1, limit: 1000 });
        const compData =
          compRes?.settings?.data?.list || compRes?.data?.list || [];
        setCompanyOptions(
          compData.map((c) => ({ label: c.companyName, value: String(c.id) })),
        );

        const grpRes = await listGroups({ page: 1, limit: 1000 });
        const grpData =
          grpRes?.settings?.data?.list || grpRes?.data?.list || [];
        setGroupOptions(
          grpData.map((g) => ({ label: g.groupName, value: String(g.id) })),
        );
      } catch (error) {
        console.error("Failed to load options for search", error);
      }
    };
    loadOptions();
  }, []);

  // Search/Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState({
    firstName: "",
    email: "",
    groupName: "",
    companyName: "",
    status: "",
  });
  const [appliedSidebarFilters, setAppliedSidebarFilters] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [logicalOperator, setLogicalOperator] = useState("AND");
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  const fields = useMemo(
    () => [
      { label: "First Name", value: "firstName", type: "text" },
      { label: "Last Name", value: "lastName", type: "text" },
      { label: "Username", value: "userName", type: "text" },
      { label: "Email", value: "email", type: "text" },
      {
        label: "Company Name",
        value: "companyId",
        type: "select",
        options: companyOptions,
      },
      {
        label: "Group/Role Name",
        value: "groupId",
        type: "select",
        options: groupOptions,
      },
      {
        label: "Status",
        value: "status",
        type: "select",
        options: [
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "InActive" },
        ],
      },
    ],
    [companyOptions, groupOptions],
  );

  const handleOpenSearch = useCallback(() => {
    if (tempFilters.length === 0 && fields.length > 0) {
      const defaultField = fields[0];
      setTempFilters([
        {
          field: defaultField.value,
          operator: "equal",
          value:
            defaultField.type === "select"
              ? defaultField.options[0]?.value || ""
              : "",
        },
      ]);
    }
    setIsSearchOpen(true);
  }, [tempFilters.length, fields]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      let backendFilters = [];
      let logicalOp = "AND";

      if (appliedSidebarFilters) {
        logicalOp = "AND";
        if (appliedSidebarFilters.firstName) {
          backendFilters.push({ key: "firstName", value: appliedSidebarFilters.firstName, operator: "like" });
        }
        if (appliedSidebarFilters.email) {
          backendFilters.push({ key: "email", value: appliedSidebarFilters.email, operator: "like" });
        }
        if (appliedSidebarFilters.groupName) {
          backendFilters.push({ key: "groupId", value: Number(appliedSidebarFilters.groupName), operator: "equal" });
        }
        if (appliedSidebarFilters.companyName) {
          backendFilters.push({ key: "companyId", value: Number(appliedSidebarFilters.companyName), operator: "equal" });
        }
        if (appliedSidebarFilters.status) {
          backendFilters.push({ key: "status", value: appliedSidebarFilters.status, operator: "equal" });
        }
      } else if (appliedFilters.length > 0) {
        logicalOp = appliedLogicalOperator;
        backendFilters = appliedFilters
          .map((row) => {
            let key = row.field;
            let value = row.value;
            let operator = row.operator;

            if (key === "companyId" || key === "groupId") {
              value = Number(value);
              if (isNaN(value)) return null;
            }

            if (value === undefined || value === null || value === "") {
              return null;
            }

            return { key, value, operator };
          })
          .filter(Boolean);
      }

      const response = await listUsers({
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
      });
      const data = response?.settings?.data || response?.data || {};
      setUsers(data.list || []);

      setTotal(data?.pagination?.total || 0);
      setLimit(data?.pagination?.limit || 10);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    appliedFilters,
    appliedLogicalOperator,
    appliedSidebarFilters,
    setTotal,
    setLimit,
  ]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: {
          label: "Add User",
          onClick: () => router.push("/admin/add"),
        },
        icons: ["refresh", "search", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        onFilterClick: () => setIsFilterOpen(true),
        onSearchClick: handleOpenSearch,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "User Management", href: "/admin" },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, router, handleOpenSearch, setIsFilterOpen]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteUser(deleteTarget.id);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message = res?.message || res?.settings?.message;
      if (isSuccess) {
        toast.success("User deleted successfully");
        setDeleteTarget(null);
        fetchUsers();
      } else {
        toast.error(message || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  }, [deleteTarget, fetchUsers]);

  const headers = useMemo(
    () => [
      { label: "User", key: "firstName" },
      { label: "Email", key: "email" },
      { label: "Company", key: "companyName" },
      { label: "Group", key: "groupName" },
      { label: "Status", key: "status" },
      { label: "Last Login", key: "lastLoginDateFormatted" },
    ],
    [],
  );

  const renderCell = useCallback(
    (item, key) => {
      if (key === "firstName") {
        return (
          <div className="flex items-center gap-3">
            {item.photoUrl ? (
              <img
                src={item.photoUrl}
                alt={item.firstName}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1565c0] flex items-center justify-center font-semibold text-xs border border-blue-200">
                {item.firstName?.[0]}
                {item.lastName?.[0]}
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
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
                item.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.status}
            </span>
            {item.isSuperAdmin ? (
              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium w-fit">
                Super Admin
              </span>
            ) : null}
          </div>
        );
      }

      return item[key] || "-";
    },
    [router, currentUser],
  );

  if (loading)
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={7} />
      </div>
    );

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

      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onSearch={() => {
          setAppliedSidebarFilters(sidebarFilters);
          setAppliedFilters([]);
          setPage(1);
          setIsFilterOpen(false);
        }}
        onReset={() => {
          const defaultSidebar = {
            firstName: "",
            email: "",
            groupName: "",
            companyName: "",
            status: "",
          };
          setSidebarFilters(defaultSidebar);
          setAppliedSidebarFilters(null);
          setPage(1);
          setIsFilterOpen(false);
        }}
        filters={sidebarFilters}
        setFilters={setSidebarFilters}
        groups={groupOptions}
        companies={companyOptions}
        statuses={[
          { label: "Active", value: "Active" },
          { label: "Inactive", value: "InActive" },
        ]}
      />

      <SearchDrawer
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={() => {
          setAppliedFilters(tempFilters);
          setAppliedLogicalOperator(tempLogicalOperator);
          setAppliedSidebarFilters(null);
          setPage(1);
          setIsSearchOpen(false);
        }}
        onReset={() => {
          setTempFilters([]);
          setAppliedFilters([]);
          setTempLogicalOperator("AND");
          setAppliedLogicalOperator("AND");
          setPage(1);
          setIsSearchOpen(false);
        }}
        filters={tempFilters}
        setFilters={setTempFilters}
        logicalOperator={tempLogicalOperator}
        setLogicalOperator={setTempLogicalOperator}
        fields={fields}
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
