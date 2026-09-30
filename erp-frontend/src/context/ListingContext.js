"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

const ListingContext = createContext();

export function ListingProvider({ children }) {
  const [view, setViewInternal] = useState("table");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [columnFilters, setColumnFilters] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [showColumnSearch, setShowColumnSearch] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const storageKey = `production_management${pathname}`;
    const urlView = searchParams.get("view");
    const storageView = typeof window !== "undefined" ? sessionStorage.getItem(storageKey) : null;

    const determinedView = urlView || storageView || "table";
    setViewInternal(determinedView);

    if (urlView && typeof window !== "undefined") {
      sessionStorage.setItem(storageKey, urlView);
    }
  }, [pathname, searchParams]);

  const setView = useCallback((newView) => {
    setViewInternal(newView);

    if (typeof window !== "undefined") {
      const storageKey = `production_management${pathname}`;
      sessionStorage.setItem(storageKey, newView);
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, searchParams, router]);

  useEffect(() => {
    setPage(1);
    setTotal(0);
    setSearch("");
    setColumnFilters({});
    setSortField("");
    setSortOrder("");
    setIsFilterDrawerOpen(false);
  }, [pathname]);

  const toggleColumnSearch = useCallback(() => {
    setShowColumnSearch((prev) => !prev);
  }, []);

  const toggleFilterDrawer = useCallback(() => {
    setIsFilterDrawerOpen((prev) => !prev);
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
    setTotal(0);
  }, []);

  const handleSetColumnFilters = useCallback((filters) => {
    setColumnFilters(filters);
    setPage(1);
  }, []);

  const handleSetSort = useCallback((field, order) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      page,
      setPage,
      limit,
      setLimit,
      total,
      setTotal,
      search,
      setSearch,
      columnFilters,
      setColumnFilters: handleSetColumnFilters,
      sortField,
      sortOrder,
      setSort: handleSetSort,
      resetPagination,
      showColumnSearch,
      setShowColumnSearch,
      toggleColumnSearch,
      isFilterDrawerOpen,
      setIsFilterDrawerOpen,
      toggleFilterDrawer,
    }),
    [
      view, page, limit, total, search, columnFilters, handleSetColumnFilters,
      sortField, sortOrder, handleSetSort, resetPagination,
      showColumnSearch, toggleColumnSearch, isFilterDrawerOpen, toggleFilterDrawer
    ]
  );

  return (
    <ListingContext.Provider value={value}>{children}</ListingContext.Provider>
  );
}

export function useListing() {
  return useContext(ListingContext);
}
