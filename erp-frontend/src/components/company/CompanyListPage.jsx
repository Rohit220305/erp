"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ListingPage from "@/components/listing/ListingPage";
import TableSkeleton from "@/components/common/TableSkeleton";
import { listCompanies } from "@/lib/api/company-api";
import { useHeader } from "@/context/HeaderContext";
import CompanyListCard from "./CompanyListCard";
import CompanyGridCard from "./CompanyGridCard";
import { useRouter } from "next/navigation";
import { useListing } from "@/context/ListingContext";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import toast from "react-hot-toast";
import Pagination from "../listing/Pagination";
import { useAuth } from "@/context/AuthContext";

export default function CompanyListPage() {
  const { setConfig, resetConfig } = useHeader();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { view, page, limit, setTotal, search, setLimit, setPage, total } =
    useListing();
  const { can } = useAuth();

  // Search/Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState({
    companyName: "",
    shortName: "",
    companyCode: "",
    email: "",
    phone: "",
    contactPersonName: "",
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
    { label: "Company Name", value: "companyName", type: "text" },
    { label: "Short Name", value: "shortName", type: "text" },
    { label: "Company Code", value: "companyCode", type: "text" },
    { label: "Company Email", value: "email", type: "text" },
    { label: "Company Phone", value: "phone", type: "text" },
    { label: "Contact Person", value: "contactPersonName", type: "text" },
    { label: "Status", value: "status", type: "select", options: [
      { label: "Active", value: "Active" },
      { label: "Inactive", value: "Inactive" },
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

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);

      let backendFilters = [];
      let logicalOp = "AND";

      if (appliedSidebarFilters) {
        logicalOp = "AND";
        if (appliedSidebarFilters.companyName) {
          backendFilters.push({ key: "companyName", value: appliedSidebarFilters.companyName, operator: "like" });
        }
        if (appliedSidebarFilters.shortName) {
          backendFilters.push({ key: "shortName", value: appliedSidebarFilters.shortName, operator: "like" });
        }
        if (appliedSidebarFilters.companyCode) {
          backendFilters.push({ key: "companyCode", value: appliedSidebarFilters.companyCode, operator: "like" });
        }
        if (appliedSidebarFilters.email) {
          backendFilters.push({ key: "email", value: appliedSidebarFilters.email, operator: "like" });
        }
        if (appliedSidebarFilters.phone) {
          backendFilters.push({ key: "phone", value: appliedSidebarFilters.phone, operator: "like" });
        }
        if (appliedSidebarFilters.contactPersonName) {
          backendFilters.push({ key: "contactPersonName", value: appliedSidebarFilters.contactPersonName, operator: "like" });
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

      const response = await listCompanies({
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
      });
      const data = response?.settings?.data || response?.data || {};
      setCompanies(data.list || []);
      setTotal(data?.pagination?.total || 0);
      setLimit(data?.pagination?.limit || 10);
    } catch (error) {
      toast.error("Failed to load companies");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, appliedFilters, appliedLogicalOperator, appliedSidebarFilters, setTotal, setLimit]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: can("COMPANY_CREATE") ? {
          label: "Add Company",
          onClick: () => router.push("/company/add"),
        } : null,
        icons: ["refresh", "search", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        showSearch: true,
        onFilterClick: () => setIsFilterOpen(true),
        onSearchClick: handleOpenSearch,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Company Master", href: "/company" },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, router, handleOpenSearch, setIsFilterOpen, can]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const headers = useMemo(
    () => [
      { label: "Logo", key: "logoUrl" },
      { label: "Company Name", key: "companyName" },
      { label: "Company Code", key: "companyCode" },
      { label: "Contact Person", key: "contactPersonName" },
      { label: "Email", key: "email" },
      { label: "Phone", key: "phone" },
      { label: "Status", key: "status" },
      { label: "Added Date", key: "addedDateFormatted" },
    ],
    [],
  );

  const renderCell = useCallback(
    (item, key) => {
      if (key === "logoUrl") {
        return item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt={item.companyName}
            className="h-10 w-10 rounded object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-200" />
        );
      }
      if (key === "companyName") {
        return (
          <p
            className="font-medium hover:cursor-pointer text-[#1565c0] hover:underline"
            onClick={() => router.push(`/company/${item.id}`)}
          >
            {item.companyName || "-"}
          </p>
        );
      }
      if (key === "status") {
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              item.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {item.status || "-"}
          </span>
        );
      }
      if (key === "phone") {
        return (
          <span>
            {item.dialCode} {item.phone}
          </span>
        );
      }
      return item[key] || "-";
    },
    [router],
  );

  if (loading)
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={8} />
      </div>
    );

  return (
    <div className="relative px-6 h-full">
      <ListingPage
        view={view}
        data={companies}
        headers={headers}
        renderCell={renderCell}
        renderListCard={(c) => <CompanyListCard key={c.id} company={c} />}
        renderGridCard={(c) => <CompanyGridCard key={c.id} company={c} />}
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
            companyName: "",
            shortName: "",
            companyCode: "",
            email: "",
            phone: "",
            contactPersonName: "",
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
          { label: "Inactive", value: "Inactive" },
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
    </div>
  );
}
