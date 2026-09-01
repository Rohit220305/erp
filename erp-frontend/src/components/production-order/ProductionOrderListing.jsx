"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import ProductionOrderTableRow from "./ProductionOrderTableRow";
import ProductionOrderListCard from "./ProductionOrderListCard";
import ProductionOrderGridCard from "./ProductionOrderGridCard";
import productionOrderConfig from "@/config/production-order.config.json";
import {
  listProductionOrders,
  getProductionOrder,
  deleteProductionOrder,
} from "@/lib/api/production-order-api";
import SideDrawer from "@/components/common/SideDrawer";

export default function ProductionOrderListing() {
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [selectedBomForDetails, setSelectedBomForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  return (
    <>
      <DynamicListing
        schema={productionOrderConfig}
        fetchData={listProductionOrders}
        fetchItem={getProductionOrder}
        deleteFn={deleteProductionOrder}
        renderTableRow={(item, onRowAction, setSelectedOrderForDetails) => (
          <ProductionOrderTableRow
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedOrderForDetails}
            setSelectedCategoryForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedBomForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
        renderListCard={(item, setSelectedOrderForDetails) => (
          <ProductionOrderListCard
            key={item.id}
            item={item}
            config={productionOrderConfig}
            onRowAction={onRowAction => {}}
            setSelectedItemForDetails={setSelectedOrderForDetails}
            setSelectedCategoryForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedBomForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
        renderGridCard={(item, setSelectedOrderForDetails) => (
          <ProductionOrderGridCard
            key={item.id}
            item={item}
            config={productionOrderConfig}
            onRowAction={onRowAction => {}}
            setSelectedItemForDetails={setSelectedOrderForDetails}
            setSelectedCategoryForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedBomForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
      />

      {/* SideDrawer for Item Details Popup */}
      <SideDrawer
        open={!!selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        moduleName="Item"
        mode="details"
        data={selectedItemForDetails ? { id: selectedItemForDetails.itemId } : null}
      />

      {/* SideDrawer for BOM Details Popup */}
      <SideDrawer
        open={!!selectedBomForDetails}
        onClose={() => setSelectedBomForDetails(null)}
        moduleName="Bom"
        mode="details"
        data={selectedBomForDetails ? { id: selectedBomForDetails.bomId } : null}
      />

      {/* SideDrawer for User Details Popup */}
      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails ? { id: selectedUserForDetails.addedBy } : null}
      />
    </>
  );
}
