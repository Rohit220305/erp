"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const ListingContext = createContext();

export function ListingProvider({ children }) {
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  
  const [columnFilters, setColumnFilters] = useState({});
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const pathname = usePathname();

  // Reset all state on every route change
  useEffect(() => {
    setPage(1);
    setTotal(0);
    setSearch("");
    setColumnFilters({});
    setSortField("");
    setSortOrder("");
  }, [pathname]);

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
    }),
    [view, page, limit, total, search, columnFilters, handleSetColumnFilters, sortField, sortOrder, handleSetSort, resetPagination]
  );

  return (
    <ListingContext.Provider value={value}>{children}</ListingContext.Provider>
  );
}

export function useListing() {
  return useContext(ListingContext);
}
