// DynamicListing.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useListing } from "@/context/ListingContext";
import { useHeader } from "@/context/HeaderContext";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSkeleton from "@/components/common/TableSkeleton";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import Pagination from "@/components/listing/Pagination";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import DynamicTableView from "./DynamicTableView";
import DynamicViewDrawer from "./DynamicViewDrawer";
import { DynamicListView, DynamicGridView } from "./DynamicViews";

export default function DynamicListing({
  schema,
  fetchData,
  fetchItem,
  deleteFn,
  renderTableRow,     
  renderListCard,     
  renderGridCard,     
  renderDrawer,        
}) {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  const {
    view, page, limit, total,
    setTotal, setLimit, setPage,
    search, columnFilters, sortField, sortOrder,
  } = useListing();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState(schema.defaultFilters || {});
  const [appliedSidebarFilters, setAppliedSidebarFilters] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  const listPermission   = schema.permissions?.list;
  const deletePermission = schema.permissions?.delete;

  // Open Search Drawer Handler
  const handleOpenSearch = () => {
    if (tempFilters.length === 0 && schema.searchFields?.length > 0) {
      const defaultField = schema.searchFields[0];
      setTempFilters([{
        field:    defaultField.value,
        operator: "equal",
        value:    defaultField.type === "select" ? (defaultField.options?.[0]?.value || "") : "",
      }]);
    }
    setIsSearchOpen(true);
  };

  // Data Fetching Function (Standard Async Function)
  const loadData = async () => {
    if (!fetchData) {
      console.warn("DynamicListing: no fetchData prop provided.");
      setInitialLoad(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      let backendFilters = [];
      let logicalOp = "AND";

      if (appliedSidebarFilters) {
        logicalOp = "AND";
        Object.keys(appliedSidebarFilters).forEach((key) => {
          const val = appliedSidebarFilters[key];
          if (val) {
            const op = key === "status" ? "equal" : "like";
            backendFilters.push({ key, value: val, operator: op });
          }
        });
      } else if (appliedFilters.length > 0) {
        logicalOp = appliedLogicalOperator;
        backendFilters = appliedFilters
          .map((row) => {
            if (row.value === undefined || row.value === null || row.value === "") return null;
            return { key: row.field, value: row.value, operator: row.operator };
          })
          .filter(Boolean);
      }

      if (columnFilters && Object.keys(columnFilters).length > 0) {
        Object.entries(columnFilters).forEach(([key, val]) => {
          if (val === undefined || val === null || val === "") return;
          const op = key === "status" ? "equal" : "like";
          backendFilters.push({ key, value: val, operator: op });
        });
      }

      const response = await fetchData({
        page,
        limit,
        search,
        filters:         backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
        sortField:       sortField || undefined,
        sortOrder:       sortOrder || undefined,
      });

      const data = response?.settings?.data || response?.data || {};
      setItems(data.items || data.list || []);
      setTotal(data?.pagination?.total  || data.total  || 0);
      setLimit(data?.pagination?.limit  || data.limit  || 10);
    } catch (err) {
      console.error("DynamicListing fetchData error:", err);
      toast.error(`Failed to load ${schema.title || "data"}`);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Header Config Effect
  useEffect(() => {
    const headerAction  = schema.actions?.header?.[0];
    const canDoAction   = headerAction && (!headerAction.permission || can(headerAction.permission));

    setConfig({
      header: {
        icons:        ["refresh", "search", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile:  true,
        showMenu:     true,
        showSearch:   true,
        onFilterClick: () => setIsFilterOpen(true),
        onSearchClick: handleOpenSearch,
        actionButton: canDoAction
          ? {
              label:   headerAction.label,
              onClick: () => {
                if (headerAction.type === "redirect" && headerAction.path) {
                  router.push(headerAction.path);
                }
              },
            }
          : null,
      },
      navbar: {
        title:       "Listing",
        breadcrumbs: [
          { label: "Master",      href: "/" },
          { label: schema.title,  href: `/${schema.moduleName.toLowerCase()}` },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, can, router, schema]);

  // Load Data Effect
  useEffect(() => {
    loadData();
  }, [
    page, limit, search,
    appliedFilters, appliedLogicalOperator, appliedSidebarFilters,
    columnFilters, sortField, sortOrder,
    fetchData, schema.title
  ]);

  // Row Action Handler
  const handleRowAction = (action, item) => {
    if (action.type === "editRedirect" || action.type === "viewRedirect") {
      let path = action.path || "";
      if (path.includes("{id}")) path = path.replace("{id}", item.id);
      router.push(path);
    } else if (action.type === "deleteModal") {
      if (deletePermission && !can(deletePermission)) {
        toast.error("You do not have permission to delete this record.");
        return;
      }
      setDeleteTarget(item);
    } else if (action.type === "viewDrawer") {
      setSelectedItemForDetails(item);
    }
  };

  // Delete Action Handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteFn) {
      console.warn("DynamicListing: no deleteFn prop provided.");
      setDeleteTarget(null);
      return;
    }
    try {
      const res       = await deleteFn({ id: deleteTarget.id });
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message   = res?.message  || res?.settings?.message;
      if (isSuccess) {
        toast.success(message || `${schema.title} deleted successfully.`);
        loadData();
      } else {
        toast.error(message || `Failed to delete ${schema.title}.`);
      }
    } catch {
      toast.error(`Failed to delete ${schema.title}.`);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (listPermission && !can(listPermission)) {
    return <AccessDenied missingPermission={listPermission} />;
  }

  if (initialLoad) {
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={schema.columns?.length || 5} />
      </div>
    );
  }

  return (
    <div className="relative px-6 h-full">

      {view === "table" && (
        <DynamicTableView
          data={items}
          config={schema}
          onRowAction={handleRowAction}
          loading={loading}
          setSelectedItemForDetails={setSelectedItemForDetails}
          renderTableRow={renderTableRow}
        />
      )}

      {view === "list" && (
        <DynamicListView
          data={items}
          config={schema}
          setSelectedItemForDetails={setSelectedItemForDetails}
          renderCard={renderListCard
            ? (item) => renderListCard(item, setSelectedItemForDetails)
            : undefined
          }
        />
      )}

      {view !== "table" && view !== "list" && (
        <DynamicGridView
          data={items}
          config={schema}
          setSelectedItemForDetails={setSelectedItemForDetails}
          renderCard={renderGridCard
            ? (item) => renderGridCard(item, setSelectedItemForDetails)
            : undefined
          }
        />
      )}

      <div className="absolute bottom-0 left-0 right-0 mx-6 bg-white border-t border-gray-200">
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${schema.title}`}
        message="Are you sure you want to delete this record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {schema.defaultFilters && (
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
            setSidebarFilters(schema.defaultFilters);
            setAppliedSidebarFilters(null);
            setPage(1);
            setIsFilterOpen(false);
          }}
          filters={sidebarFilters}
          setFilters={setSidebarFilters}
          statuses={schema.sidebarStatuses || []}
        />
      )}

      {schema.searchFields && (
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
          fields={schema.searchFields}
        />
      )}

      {renderDrawer
        ? renderDrawer(
            !!selectedItemForDetails,
            () => setSelectedItemForDetails(null),
            selectedItemForDetails
          )
        : (
          <DynamicViewDrawer
            open={!!selectedItemForDetails}
            onClose={() => setSelectedItemForDetails(null)}
            item={selectedItemForDetails}
            schema={schema}
            fetchItem={fetchItem}
          />
        )
      }
    </div>
  );
}
