"use client";

import { useEffect, useState } from "react";
import ListingPage from "@/components/listing/ListingPage";
import TableSkeleton from "@/components/common/TableSkeleton";
import FilterDrawer from "@/components/common/FilterDrawer";
import SearchDrawer from "@/components/common/SearchDrawer";
import { useHeader } from "@/context/HeaderContext";
import { useListing } from "@/context/ListingContext";
import toast from "react-hot-toast";

export default function DynamicListing({
  config,
  fetchData,
  renderCell,
  renderListCard,
  renderGridCard,
  headerConfig = {},
  navbarConfig = {},
}) {
  const { setConfig, resetConfig } = useHeader();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { view, page, limit, setTotal, search, setLimit, setPage } = useListing();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState(config.defaultFilters || {});
  const [appliedSidebarFilters, setAppliedSidebarFilters] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tempLogicalOperator, setTempLogicalOperator] = useState("AND");
  const [tempFilters, setTempFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [appxliedLogicalOperator, setAppliedLogicalOperator] = useState("AND");

  const handleOpenSearch = () => {
    if (tempFilters.length === 0 && config.searchFields?.length > 0) {
      const defaultField = config.searchFields[0];
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

  const loadData = async () => {
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

      const response = await fetchData({
        page,
        limit,
        search,
        filters: backendFilters.length > 0 ? backendFilters : undefined,
        logicalOperator: logicalOp,
      });

      const data = response?.settings?.data || response?.data || {};
      setItems(data.list || []);
      setTotal(data?.pagination?.total || 0);
      setLimit(data?.pagination?.limit || 10);
    } catch (error) {
      toast.error(`Failed to load ${config.title || "data"}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        ...headerConfig,
      },
      navbar: {
        title: "Listing",
        breadcrumbs: [],
        ...navbarConfig,
      },
    });
    return () => resetConfig();
  }, [setConfig, headerConfig, navbarConfig]);

  useEffect(() => {
    setTimeout(() => loadData(), 0);
  }, [page, limit, search, appliedFilters, appliedLogicalOperator, appliedSidebarFilters, fetchData, config.title]);

  if (loading) {
    return (
      <div className="px-6">
        <TableSkeleton rows={8} cols={config.columns?.length || 5} />
      </div>
    );
  }

  return (
    <div className="relative px-6 h-full">
      <ListingPage
        view={view}
        data={items}
        headers={config.columns}
        renderCell={renderCell}
        renderListCard={renderListCard}
        renderGridCard={renderGridCard}
      />

    </div>
  );
}
