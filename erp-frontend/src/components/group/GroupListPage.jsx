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
import { useAuth } from "@/context/AuthContext";

export default function GroupListPage() {
  const { setConfig, resetConfig } = useHeader();
  const { view, page, limit, setTotal, search, setLimit, setPage, total, columnFilters, sortField, sortOrder } =
    useListing();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const router = useRouter();
  const { can } = useAuth();

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

      // Add column filters
      if (columnFilters && Object.keys(columnFilters).length > 0) {
        Object.entries(columnFilters).forEach(([key, val]) => {
          if (val === undefined || val === null || val === "") return;
          const op = key === "status" ? "equal" : "like";
          backendFilters.push({ key, value: val, operator: op });
        });
      }

      const response = await listGroups({
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
        sortField,
        sortOrder,
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
      setInitialLoad(false);
    }
  }, [page, limit, search, appliedFilters, appliedLogicalOperator, appliedSidebarFilters, columnFilters, sortField, sortOrder, setTotal, setLimit]);

  useEffect(() => {
    setConfig({
      header: {
          actionButton: can("GROUP_CREATE") ? {
            label: "Add Group",
            onClick: () => router.push("/group/add"),
          } : null,
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
  }, [setConfig, router, handleOpenSearch, setIsFilterOpen, can]); 
  
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

  const headers = useMemo(() => {
    const list = [
      { label: "Group Code", key: "groupCode", searchable: true, sortable: false },
      { label: "Group Name", key: "groupName", searchable: true, sortable: false },
      { label: "Description", key: "description", searchable: true, sortable: false },
      { label: "Status", key: "status", searchable: true, sortable: false, type: "select", options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "InActive" },
      ] },
      { label: "Added Date", key: "addedDateFormatted", searchable: false, sortable: false },
    ];
    // if (can("GROUP_UPDATE") || can("GROUP_DELETE")) {
    //   list.push({ label: "Actions", key: "actions" });
    // }
    return list;
  }, [can]);

  const renderCell = useCallback((item, key) => {
    if (key === "groupName") {
      return (
        <p
          className="font-medium text-[#1565c0] hover:underline cursor-pointer text-sm"
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
    // if (key === "actions") {
    //   return (
    //     <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
    //       {can("GROUP_UPDATE") && (
    //         <button
    //           onClick={() => router.push(`/group/edit/${item.id}`)}
    //           className="text-[#1565c0] hover:text-[#0f57a6] font-medium text-xs border border-[#1565c0]/15 rounded px-2.5 py-1 bg-[#1565c0]/5 hover:bg-[#1565c0]/10 transition cursor-pointer"
    //         >
    //           Edit
    //         </button>
    //       )}
    //       {can("GROUP_DELETE") && (
    //         <button
    //           onClick={() => setDeleteTarget(item)}
    //           className="text-red-600 hover:text-red-700 font-medium text-xs border border-red-200 rounded px-2.5 py-1 bg-red-50 hover:bg-red-100 transition cursor-pointer"
    //         >
    //           Delete
    //         </button>
    //       )}
    //     </div>
    //   );
    // }
    
    return item[key] || "-";
  }, [router, can]);

  if (initialLoad) {
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={6} />
      </div>
    );
  }

  if (!can("GROUP_VIEW")) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold text-sm">
        Permission Denied: You do not have the required "GROUP_VIEW" permission to access this page.
      </div>
    );
  }

  return (
    <div className="relative px-6 h-full">
      <ListingPage
        view={view}
        data={groups}
        headers={headers}
        renderCell={renderCell}
        renderListCard={(u) => <GroupListCard key={u.id} group={u} handleDelete={() => setDeleteTarget(u)} can={can} />}
        renderGridCard={(u) => <GroupGridCard key={u.id} group={u} handleDelete={() => setDeleteTarget(u)} can={can}/>}
        loading={loading}
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


