// ConfigDrivenListing.jsx
"use client";

import React from "react";
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

  // Plain variable computation for columns (no useMemo needed)
  const columns = [...(config?.columns || [])];
  if (config?.actions?.row?.length > 0) {
    columns.push({ label: "Actions", key: "actions", type: "actions" });
  }

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

  // Plain variable computation for headerAction (no useMemo needed)
  const headerConfigActions = config?.actions?.header || [];
  const primaryHeaderAction = headerConfigActions[0];
  const canDoHeaderAction =
    primaryHeaderAction && (!primaryHeaderAction.permission || can(primaryHeaderAction.permission));

  const headerAction = canDoHeaderAction
    ? {
        label: primaryHeaderAction.label,
        onClick: () => {
          if (primaryHeaderAction.type === "redirect" && primaryHeaderAction.path) {
            router.push(primaryHeaderAction.path);
          }
        },
      }
    : null;

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
