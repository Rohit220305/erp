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
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import toast from "react-hot-toast";

export default function GroupListPage() {
  const { setConfig, resetConfig } = useHeader();
  const { view, page, limit, setTotal, search, setLimit, setPage, total } =
    useListing();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();

  // Search/Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState({
    groupCode: "",
    groupName: "",
    status: "",
  });
  const [appliedSidebarFilters, setAppliedSidebarFilters] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [logicalOperator, setLogicalOperator] = useState("AND");
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  const fields = useMemo(() => [
    { label: "Group Code", value: "groupCode", type: "text" },
    { label: "Group Name", value: "groupName", type: "text" },
    { label: "Description", value: "description", type: "text" },
    { label: "Status", value: "status", type: "select", options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "InActive" },
    ]}
  ], []);

  const handleOpenSearch = useCallback(() => {
    if (tempFilters.length === 0 && fields.length > 0) {
      const defaultField = fields[0];
      setTempFilters([
        {
          field: defaultField.value,
          operator: "equal",
          value: defaultField.type === "select" ? (defaultField.options[0]?.value || "") : "",
        },
      ]);
    }
    setIsSearchOpen(true);
  }, [tempFilters.length, fields]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);

      let backendFilters = [];
      let logicalOp = "AND";

      if (appliedSidebarFilters) {
        logicalOp = "AND";
        if (appliedSidebarFilters.groupCode) {
          backendFilters.push({ key: "groupCode", value: appliedSidebarFilters.groupCode, operator: "like" });
        }
        if (appliedSidebarFilters.groupName) {
          backendFilters.push({ key: "groupName", value: appliedSidebarFilters.groupName, operator: "like" });
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

            if (value === undefined || value === null || value === "") {
              return null;
            }

            return { key, value, operator };
          })
          .filter(Boolean);
      }

      const response = await listGroups({
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
      });
      // console.log("Groups Response:", response);
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
  }, [page, limit, search, appliedFilters, appliedLogicalOperator, appliedSidebarFilters, setTotal, setLimit]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: {
          label: "Add Group",
          onClick: () => router.push("/group/add"),
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
          { label: "Group Master", href: "/group" },
        ],
      },
    });

    return () => resetConfig();
  }, [setConfig, router, handleOpenSearch, setIsFilterOpen]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteGroup(deleteTarget.id);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message = res?.message || res?.settings?.message;
      if (isSuccess) {
        toast.success("Group deleted successfully");
        setDeleteTarget(null);
        fetchGroups();
      } else {
        toast.error(message || "Failed to delete group");
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
      const isActive = item.status === "Active" || item.status === "active";
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isActive ? "Active" : "Inactive"}
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
            groupCode: "",
            groupName: "",
            status: "",
          };
          setSidebarFilters(defaultSidebar);
          setAppliedSidebarFilters(null);
          setPage(1);
          setIsFilterOpen(false);
        }}
        filters={sidebarFilters}
        setFilters={setSidebarFilters}
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
        title="Delete Group"
        message={`Are you sure you want to delete "${deleteTarget?.groupName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
