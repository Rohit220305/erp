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
import toast from "react-hot-toast";
import Pagination from "../listing/Pagination";

export default function CompanyListPage() {
  const { setConfig, resetConfig } = useHeader();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { view, page, limit, setTotal, search, setLimit, setPage, total } =
    useListing();

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listCompanies({ page, limit, search });
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
  }, [page, limit, search, setTotal]);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: {
          label: "Add Company",
          onClick: () => router.push("/company/add"),
        },
        icons: ["refresh", "filter", "view"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        showSearch: true,
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
  }, [setConfig, router]); // resetConfig is stable (useCallback) and only used in cleanup — not a dep

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
    </div>
  );
}
