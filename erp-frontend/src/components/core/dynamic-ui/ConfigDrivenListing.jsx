"use client";

import React, { useMemo } from "react";
import DynamicListing from "@/components/listing/DynamicListing";
import CellRenderer from "./CellRenderer";
import ActionRenderer from "./ActionRenderer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ConfigDrivenListing({
  config,
  fetchData,
  onRowAction,
  renderListCard,
  renderGridCard,
}) {
  const { can } = useAuth();
  const router = useRouter();

  // Dynamically append an "Actions" column if there are row actions defined
  const columns = useMemo(() => {
    const cols = [...(config.columns || [])];
    if (config.actions?.row?.length > 0) {
      cols.push({ label: "Actions", key: "actions", type: "actions" });
    }
    return cols;
  }, [config.columns, config.actions]);

  // Create the generic renderCell function
  const renderCell = (item, key) => {
    const column = columns.find((c) => c.key === key);
    if (!column) return item[key] || "-";

    if (column.type === "actions") {
      return (
        <ActionRenderer
          item={item}
          actions={config.actions.row}
          onActionClick={onRowAction}
        />
      );
    }

    return <CellRenderer item={item} column={column} />;
  };

  // Resolve header action
  const headerAction = useMemo(() => {
    const headerConfigActions = config.actions?.header || [];
    if (headerConfigActions.length === 0) return null;

    const action = headerConfigActions[0]; // Assuming one primary header action for now
    if (action.permission && !can(action.permission)) return null;

    return {
      label: action.label,
      onClick: () => {
        if (action.type === "redirect" && action.path) {
          router.push(action.path);
        }
      },
    };
  }, [config.actions, can, router]);

  // Construct the new config for DynamicListing (to support search/filters correctly)
  const dynamicConfig = {
    title: config.title,
    columns,
    searchFields: config.searchFields,
    defaultFilters: config.defaultFilters,
    sidebarStatuses: config.sidebarStatuses,
  };

  return (
    <DynamicListing
      config={dynamicConfig}
      fetchData={fetchData}
      renderCell={renderCell}
      renderListCard={renderListCard}
      renderGridCard={renderGridCard}
      headerConfig={{
        actionButton: headerAction,
      }}
      navbarConfig={{
        title: "Listing",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: config.title, href: `/${config.moduleName.toLowerCase()}` },
        ],
      }}
    />
  );
}
