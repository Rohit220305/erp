"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useListing } from "@/context/ListingContext";
import { useHeader } from "@/context/HeaderContext";
import { useActionDispatcher } from "@/lib/actionDispatcher";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSkeleton from "@/components/common/TableSkeleton";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import Pagination from "@/components/listing/Pagination";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import DynamicTableView from "./DynamicTableView";

export default function DynamicListing({ schema }) {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  const { dispatchAction } = useActionDispatcher();
  const { view, page, limit, setTotal, search, setLimit, setPage, total, columnFilters, sortField, sortOrder } = useListing();

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

  const listPermission = schema.actions?.fetchPermission;
  const deletePermission = schema.actions?.deletePermission;

  const handleOpenSearch = useCallback(() => {
    if (tempFilters.length === 0 && schema.searchFields?.length > 0) {
      const defaultField = schema.searchFields[0];
      setTempFilters([
        {
          field: defaultField.value,
          operator: "equal",
          value: defaultField.type === "select" ? (defaultField.options[0]?.value || "") : "",
        },
      ]);
    }
    setIsSearchOpen(true);
  }, [tempFilters.length, schema.searchFields]);

  const loadData = useCallback(async () => {
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

      const fetchActionKey = schema.actions?.fetch;
      if (!fetchActionKey) {
        console.warn("No fetch action defined in schema.");
        return;
      }

      const response = await dispatchAction(fetchActionKey, {
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
        sortField,
        sortOrder,
      }, { showToast: false });

      const data = response?.settings?.data || response?.data || {};
      setItems(data.items || data.list || []);
      setTotal(data?.pagination?.total || data.total || 0);
      setLimit(data?.pagination?.limit || data.limit || 10);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [page, limit, search, appliedFilters, appliedLogicalOperator, appliedSidebarFilters, columnFilters, sortField, sortOrder, setTotal, setLimit, dispatchAction, schema.actions]);

  // Handle header config
  useEffect(() => {
    const headerAction = schema.actions?.header?.[0];
    const canDoAction = headerAction && (!headerAction.permission || can(headerAction.permission));
    
    setConfig({
      header: {
        icons: ["refresh", "search", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        showSearch: true,
        onFilterClick: () => setIsFilterOpen(true),
        onSearchClick: handleOpenSearch,
        actionButton: canDoAction
          ? {
              label: headerAction.label,
              onClick: () => {
                if (headerAction.type === "redirect" && headerAction.path) {
                  router.push(headerAction.path);
                }
              },
            }
          : null,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: schema.title, href: `/${schema.moduleName.toLowerCase()}` },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, handleOpenSearch, can, router, schema]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRowAction = useCallback((action, item) => {
    if (action.type === "editRedirect") {
      let path = action.path;
      if (path.includes("{id}")) {
        path = path.replace("{id}", item.id);
      }
      router.push(path);
    } else if (action.type === "viewRedirect") {
      let path = action.path;
      if (path.includes("{id}")) {
        path = path.replace("{id}", item.id);
      }
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
  }, [router, can, deletePermission]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const deleteActionKey = schema.actions?.delete;
    if (!deleteActionKey) {
        console.warn("No delete action defined in schema.");
        return;
    }
    
    try {
      const res = await dispatchAction(deleteActionKey, { id: deleteTarget.id }, {
        successMessage: `${schema.title} deleted successfully.`,
        errorMessage: `Failed to delete ${schema.title}.`
      });
      
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      if (isSuccess) {
        loadData();
      }
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadData, dispatchAction, schema]);

  const paginationProps = {
    page,
    limit,
    total,
    onPageChange: setPage,
    onLimitChange: setLimit,
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
      {/* We can expand to support Grid/List view later, for now TableView is supported */}
      <DynamicTableView 
        data={items} 
        config={schema} 
        onRowAction={handleRowAction} 
        loading={loading} 
        setSelectedItemForDetails={setSelectedItemForDetails} 
      />

      <div className="absolute bottom-0 left-0 right-0 mx-6 bg-white border-t border-gray-200">
        <Pagination {...paginationProps} />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${schema.title}`}
        message={`Are you sure you want to delete this record? This action cannot be undone.`}
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
    </div>
  );
}
