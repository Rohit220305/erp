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

  const pathname = usePathname();

  // Reset pagination and search on every route change
  useEffect(() => {
    setPage(1);
    setTotal(0);
    setSearch("");
  }, [pathname]);

  const resetPagination = useCallback(() => {
    setPage(1);
    setTotal(0);
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
      resetPagination,
    }),
    [view, page, limit, total, search, resetPagination]
  );

  return (
    <ListingContext.Provider value={value}>{children}</ListingContext.Provider>
  );
}

export function useListing() {
  return useContext(ListingContext);
}
