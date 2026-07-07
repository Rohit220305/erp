"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { listCompanies, deleteCompany } from "@/lib/api/company-api";
import { useAuth } from "@/context/AuthContext";
import { useListing } from "@/context/ListingContext";
import { useHeader } from "@/context/HeaderContext";
import companyConfig from "@/config/company.config.json";
import ConfirmModal from "@/components/common/ConfirmModal";
import TableSkeleton from "@/components/common/TableSkeleton";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import Pagination from "@/components/listing/Pagination";
import toast from "react-hot-toast";

import {
  CompanyTableView,
  CompanyListView,
  CompanyGridView,
} from "./CompanyViews";

export default function CompanyListPage() {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  const { view, page, limit, setTotal, search, setLimit, setPage, total, columnFilters, sortField, sortOrder } = useListing();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Search/Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState(companyConfig.defaultFilters || {});
  const [appliedSidebarFilters, setAppliedSidebarFilters] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  const handleOpenSearch = useCallback(() => {
    if (tempFilters.length === 0 && companyConfig.searchFields?.length > 0) {
      const defaultField = companyConfig.searchFields[0];
      setTempFilters([
        {
          field: defaultField.value,
          operator: "equal",
          value: defaultField.type === "select" ? (defaultField.options[0]?.value || "") : "",
        },
      ]);
    }
    setIsSearchOpen(true);
  }, [tempFilters.length]);

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

      // Add column filters
      if (columnFilters && Object.keys(columnFilters).length > 0) {
        Object.entries(columnFilters).forEach(([key, val]) => {
          if (val === undefined || val === null || val === "") return;
          const op = key === "status" ? "equal" : "like";
          backendFilters.push({ key, value: val, operator: op });
        });
      }

      const response = await listCompanies({
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
        sortField,
        sortOrder,
      });

      const data = response?.settings?.data || response?.data || {};
      setCompanies(data.list || []);
      setTotal(data?.pagination?.total || 0);
      setLimit(data?.pagination?.limit || 10);
    } catch (error) {
      toast.error(`Failed to load ${companyConfig.title || "companies"}`);
      console.error(error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [page, limit, search, appliedFilters, appliedLogicalOperator, appliedSidebarFilters, columnFilters, sortField, sortOrder, setTotal, setLimit]);

  // Handle header config
  useEffect(() => {
    const headerAction = companyConfig.actions?.header?.[0];
    const canDoAction = headerAction && (!headerAction.permission || can(headerAction.permission));
    // console.log("Header Action:", headerAction, "Can Do Action:", canDoAction);
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
          { label: companyConfig.title, href: `/${companyConfig.moduleName.toLowerCase()}` },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, handleOpenSearch, can, router]);

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
      setDeleteTarget(item);
    }
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteCompany(deleteTarget.id);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message = res?.message || res?.settings?.message;
      if (isSuccess) {
        toast.success("Company deleted successfully");
        loadData();
      } else {
        toast.error(message || "Failed to delete company");
      }
    } catch {
      toast.error("Failed to delete company");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, loadData]);

  const paginationProps = {
    page,
    limit,
    total,
    onPageChange: setPage,
    onLimitChange: setLimit,
  };

  if (!can("COMPANY_VIEW")) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold text-sm">
        Permission Denied: You do not have the required "COMPANY_VIEW"
        permission to access this page.
      </div>
    );
  }

  if (initialLoad) {
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={companyConfig.columns?.length || 5} />
      </div>
    );
  }

  return (
    <div className="relative px-6 h-full">
      {/* Rendering specific view based on context */}
      {view === "table" ? (
        <CompanyTableView data={companies} config={companyConfig} onRowAction={handleRowAction} loading={loading} />
      ) : view === "list" ? (
        <CompanyListView data={companies} config={companyConfig} />
      ) : (
        <CompanyGridView data={companies} config={companyConfig} />
      )}

      {/* Shared Pagination component */}
      <div className="absolute bottom-0 left-0 right-0 mx-6 bg-white border-t border-gray-200">
        <Pagination {...paginationProps} />
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteTarget?.companyName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {companyConfig.defaultFilters && (
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
            setSidebarFilters(companyConfig.defaultFilters);
            setAppliedSidebarFilters(null);
            setPage(1);
            setIsFilterOpen(false);
          }}
          filters={sidebarFilters}
          setFilters={setSidebarFilters}
          statuses={companyConfig.sidebarStatuses || []}
        />
      )}

      {companyConfig.searchFields && (
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
          fields={companyConfig.searchFields}
        />
      )}
    </div>
  );
}
