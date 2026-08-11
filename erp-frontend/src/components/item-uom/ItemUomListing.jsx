"use client";
import React from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import config from "@/config/item-uom.config.json";
import { listItemUoms, deleteItemUom, getItemUom } from "@/lib/api/item-uom-api";
import SideDrawer from "@/components/common/SideDrawer";
import ItemUomDrawerForm from "./ItemUomDrawerForm";
import ItemUomTableRow from "./ItemUomTableRow";

export default function ItemUomListing() {
  return (
    <DynamicListing
      schema={config}
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
