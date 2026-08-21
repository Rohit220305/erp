"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import config from "@/config/item-uom.config.json";
import { listItemUoms, deleteItemUom, getItemUom } from "@/lib/api/item-uom-api";
import SideDrawer from "@/components/common/SideDrawer";
import ItemUomDrawerForm from "./ItemUomDrawerForm";
import ItemUomTableRow from "./ItemUomTableRow";

export default function ItemUomListing() {
  const customConfig = {
    ...config,
    forceView: "table",
    headerIcons: config.headerIcons
      ? config.headerIcons.filter((icon) => icon !== "view")
      : (config.defaultFilters ? ["refresh", "search", "filter", "filterDrawer"] : ["refresh", "search", "filter"]),
  };

  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listItemUoms}
      fetchItem={getItemUom}
      deleteFn={deleteItemUom}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <ItemUomTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
