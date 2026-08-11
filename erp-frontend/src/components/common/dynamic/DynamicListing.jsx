"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useListing } from "@/context/ListingContext";
import { useHeader } from "@/context/HeaderContext";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSkeleton from "@/components/common/TableSkeleton";
import Loader from "@/components/common/Loader";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import Pagination from "@/components/listing/Pagination";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import DynamicTableView from "./DynamicTableView";
import { DynamicListView, DynamicGridView } from "./DynamicViews";

export default function DynamicListing({
  schema,
  fetchData,
  fetchItem,
  deleteFn,
  renderTableRow,
  renderListCard,
  renderGridCard,
  extraApiParams,
}) {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  const {
    view, page, limit, total,
    setTotal, setLimit, setPage,
    search, columnFilters, sortField, sortOrder,
    toggleColumnSearch, isFilterDrawerOpen, setIsFilterDrawerOpen,
  } = useListing();

  const activeView = schema.forceView || view;

  const [actualView, setActualView] = useState(activeView);
  const { execute: executeViewSwitch, isLoading: isSwitchingView } = useAsyncAction(1000);

  useEffect(() => {
    if (activeView !== actualView) {
      executeViewSwitch(async () => {
        setActualView(activeView);
      });
    }
  }, [activeView, actualView, executeViewSwitch]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [drawerState, setDrawerState] = useState({ mode: null, data: null });
  const openDetails = (item) => setDrawerState({ mode: "details", data: item });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState(schema.defaultFilters || {});
  const [appliedSidebarFilters, setAppliedSidebarFilters] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  const listPermission = schema.permissions?.list;
  const deletePermission = schema.permissions?.delete;

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  useEffect(() => {
    if (isSearchOpen) {
      if (appliedFilters.length > 0) {
        setTempFilters(JSON.parse(JSON.stringify(appliedFilters)));
        setTempLogicalOperator(appliedLogicalOperator);
      } else if (schema.searchFields?.length > 0) {
        const defaultField = schema.searchFields[0];
        setTempFilters([{
          field: defaultField.value,
          operator: "equal",
          value: defaultField.type === "select" ? (defaultField.options?.[0]?.value || "") : "",
        }]);
        setTempLogicalOperator("AND");
      } else {
        setTempFilters([]);
        setTempLogicalOperator("AND");
      }
    }
  }, [isSearchOpen, appliedFilters, appliedLogicalOperator, schema.searchFields]);

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

      const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
      const [response] = await Promise.all([
        fetchData({
          page,
          limit,
          search,
          filters: backendFilters.length > 0 ? backendFilters : undefined,
          logicalOperator: logicalOp,
          sortField: sortField || undefined,
          sortOrder: sortOrder || undefined,
          ...extraApiParams,
        }),
        minDelay
      ]);
      const data = response?.settings?.data || response?.data || {};
      setItems(data.items || data.list || []);
      setTotal(data?.pagination?.total || data.total || 0);
      setLimit(data?.pagination?.limit || data.limit || 10);
    } catch (err) {
      console.error("DynamicListing fetchData error:", err);
      toast.error(`Failed to load ${schema.title || "data"}`);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    const headerAction = schema.actions?.header?.[0];
    const canDoAction = headerAction && (!headerAction.permission || can(headerAction.permission));

    const defaultIcons = schema.defaultFilters
      ? ["refresh", "search", "filter", "filterDrawer", "view"]
      : ["refresh", "search", "filter", "view"];

    setConfig({
      header: {
        icons: schema.headerIcons || defaultIcons,
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        showSearch: true,
        onColumnSearchClick: toggleColumnSearch,
        onFilterDrawerClick: () => setIsFilterDrawerOpen(true),
        onFilterClick: () => setIsFilterDrawerOpen(true),
        onSearchClick: handleOpenSearch,
        actionButton: canDoAction
          ? {
            label: headerAction.label,
            onClick: () => {
              if (headerAction.type === "redirect" && headerAction.path) {
                router.push(headerAction.path);
              } else if (headerAction.type === "addDrawer") {
                setDrawerState({ mode: "add", data: null });
              }
            },
          }
          : null,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: schema.title, href: schema.modulePath || `/${schema.moduleName.toLowerCase()}` },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, can, router, schema, toggleColumnSearch, setIsFilterDrawerOpen]);

  useEffect(() => {
    loadData();
  }, [
    page, limit, search,
    appliedFilters, appliedLogicalOperator, appliedSidebarFilters,
    columnFilters, sortField, sortOrder,
    fetchData, schema.title
  ]);

  const handleRowClick = (row) => {
    if (!schema.primaryAction) return;

    if (schema.primaryAction.type === "drawer") {
      setDrawerState({
        mode: "details",
        data: { id: row.id }
      });
    } else if (schema.primaryAction.type === "page") {
      router.push(schema.primaryAction.path.replace("{id}", row.id));
    }
  };

  const handleRowAction = (action, item) => {
    if (action.type === "editRedirect" || action.type === "viewRedirect") {
      let path = action.path || "";
      if (path.includes("{id}")) path = path.replace("{id}", item.id);
      router.push(path);
    } else if (action.type === "editDrawer") {
      setDrawerState({ mode: "edit", data: item });
    } else if (action.type === "deleteModal") {
      if (deletePermission && !can(deletePermission)) {
        toast.error("You do not have permission to delete this record.");
        return;
      }
      setDeleteTarget(item);
    } else if (action.type === "viewDrawer") {
      openDetails(item);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!deleteFn) {
      console.warn("DynamicListing: no deleteFn prop provided.");
      setDeleteTarget(null);
      return;
    }
    try {
      const res = await deleteFn({ id: deleteTarget.id });
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message = res?.message || res?.settings?.message;
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
    return <Loader fullPage />;
  }
  return (
    <div className="relative px-6 h-full">
      {isSwitchingView ? (
        <div className="flex h-[calc(100vh-250px)] items-center justify-center">
          <Loader size="xl" />
        </div>
      ) : (
        <>
          {(actualView === "table" || schema.forceView === "table") && (
            <DynamicTableView
              data={items}
              config={schema}
              onRowAction={handleRowAction}
              loading={loading}
              setSelectedItemForDetails={openDetails}
              renderTableRow={renderTableRow}
            />
          )}

          {schema.forceView !== "table" &&
            actualView === "list" &&
            (loading ? (
              <div className="flex h-[calc(100vh-250px)] items-center justify-center">
                <Loader size="lg" />
              </div>
            ) : (
              <DynamicListView
                data={items}
                config={schema}
                setSelectedItemForDetails={openDetails}
                renderCard={
                  renderListCard
                    ? (item) => renderListCard(item, openDetails)
                    : undefined
                }
              />
            ))}

          {schema.forceView !== "table" &&
            actualView === "grid" &&
            (loading ? (
              <div className="flex h-[calc(100vh-250px)] items-center justify-center">
                <Loader size="lg" />
              </div>
            ) : (
              <DynamicGridView
                data={items}
                config={schema}
                setSelectedItemForDetails={openDetails}
                renderCard={
                  renderGridCard
                    ? (item) => renderGridCard(item, openDetails)
                    : undefined
                }
              />
            ))}
        </>
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
          open={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          onSearch={() => {
            setAppliedSidebarFilters(sidebarFilters);
            setAppliedFilters([]);
            setPage(1);
            setIsFilterDrawerOpen(false);
          }}
          onReset={() => {
            setSidebarFilters(schema.defaultFilters);
            setAppliedSidebarFilters(null);
            setPage(1);
            setIsFilterDrawerOpen(false);
          }}
          filters={sidebarFilters}
          setFilters={setSidebarFilters}
          statuses={schema.sidebarStatuses || []}
          fields={schema.sidebarFields}
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

      <SideDrawer
        open={drawerState.mode !== null}
        onClose={() => setDrawerState({ mode: null, data: null })}
        moduleName={schema.moduleName}
        mode={drawerState.mode}
        data={drawerState.data}
        onSuccess={() => {
          setDrawerState({ mode: null, data: null });
          loadData();
        }}
      />
    </div>
  );
}
