// GroupListPage.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListingPage from "@/components/listing/ListingPage";
import TableSkeleton from "@/components/common/TableSkeleton";
import { listGroups, deleteGroup } from "@/lib/api/group-api";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";
import GroupListCard from "./GroupListCard";
import GroupGridCard from "./GroupGridCard";
import GroupTableRow from "./GroupTableRow";
import ConfirmModal from "@/components/common/ConfirmModal";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

// Module-level Static Constants (Computed once when module loads)
const SEARCH_FIELDS = [
  { label: "Group Name", value: "groupName", type: "text" },
  { label: "Group Code", value: "groupCode", type: "text" },
  { label: "Description", value: "description", type: "text" },
  {
    label: "Status",
    value: "status",
    type: "select",
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "InActive" },
    ],
  },
];

const TABLE_HEADERS = [
  {
    label: "Group Name",
    key: "groupName",
    searchable: true,
    sortable: true,
  },
  {
    label: "Group Code",
    key: "groupCode",
    searchable: true,
    sortable: true,
  },
  {
    label: "Description",
    key: "description",
    searchable: true,
    sortable: true,
  },
  {
    label: "Status",
    key: "status",
    searchable: true,
    sortable: false,
    type: "select",
    options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "InActive" },
    ],
  },
  {
    label: "Added Date",
    key: "addedDateFormatted",
    searchable: false,
    sortable: true,
  },
];

const SIDEBAR_STATUSES = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "InActive" },
];

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
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  // Open Search Drawer Handler (Standard function without useCallback)
  const handleOpenSearch = () => {
    if (tempFilters.length === 0 && SEARCH_FIELDS.length > 0) {
      const defaultField = SEARCH_FIELDS[0];
      setTempFilters([
        {
          field: defaultField.value,
          operator: "equal",
          value: defaultField.type === "select" ? (defaultField.options[0]?.value || "") : "",
        },
      ]);
    }
    setIsSearchOpen(true);
  };

  // Fetch Groups Data (Standard async function without useCallback)
  const fetchGroups = async () => {
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
  };

  // Header Config Effect
  useEffect(() => {
    setConfig({
      header: {
        actionButton: can("GROUP_CREATE") ? {
          label: "Add Group",
          onClick: () => router.push("/group/add"),
        } : null,
        icons: ["search", "filter", "view"],
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
  }, [setConfig, router, setIsFilterOpen, can]); 

  // Fetch Data Effect
  useEffect(() => {
    fetchGroups();
  }, [
    page, limit, search,
    appliedFilters, appliedLogicalOperator, appliedSidebarFilters,
    columnFilters, sortField, sortOrder,
    setTotal, setLimit
  ]);

  // Delete Action Handler (Standard async function without useCallback)
  const handleDelete = async () => {
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
  };

  // Render Cell Handler (Standard function without useCallback)
  const renderCell = (item, key) => (
    <GroupTableRow
      item={item}
      columnKey={key}
    />
  );

  if (initialLoad) {
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={6} />
      </div>
    );
  }

  if (!can("GROUP_VIEW")) {
    return <AccessDenied missingPermission="GROUP_VIEW" />;
  }

  return (
    <div className="relative px-6 h-full">
      <ListingPage
        view={view}
        data={groups}
        headers={TABLE_HEADERS}
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
        statuses={SIDEBAR_STATUSES}
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
        fields={SEARCH_FIELDS}
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
