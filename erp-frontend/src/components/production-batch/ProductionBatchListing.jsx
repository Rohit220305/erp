"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import ProductionBatchTableRow from "./ProductionBatchTableRow";
import ProductionBatchListCard from "./ProductionBatchListCard";
import ProductionBatchGridCard from "./ProductionBatchGridCard";
import productionBatchConfig from "@/config/production-batch.config.json";
import {
  listProductionBatch,
  getProductionBatchDetails,
  deleteProductionBatch,
} from "@/lib/api/production-batch-api";
import SideDrawer from "@/components/common/SideDrawer";

export default function ProductionBatchListing() {
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [selectedBomForDetails, setSelectedBomForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  return (
    <>
      <DynamicListing
        schema={productionBatchConfig}
        fetchData={listProductionBatch}
        fetchItem={getProductionBatchDetails}
        deleteFn={deleteProductionBatch}
        renderTableRow={(item, onRowAction, setSelectedBatchForDetails) => (
          <ProductionBatchTableRow
            item={item}
            onRowAction={onRowAction}
            setSelectedBatchForDetails={setSelectedBatchForDetails}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
            setSelectedBomForDetails={setSelectedBomForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
        renderListCard={(item, setSelectedBatchForDetails) => (
          <ProductionBatchListCard
            key={item.id}
            item={item}
            config={productionBatchConfig}
            setSelectedBatchForDetails={setSelectedBatchForDetails}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
            setSelectedBomForDetails={setSelectedBomForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
        renderGridCard={(item, setSelectedBatchForDetails) => (
          <ProductionBatchGridCard
            key={item.id}
            item={item}
            config={productionBatchConfig}
            setSelectedBatchForDetails={setSelectedBatchForDetails}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
            setSelectedBomForDetails={setSelectedBomForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
      />

      <SideDrawer
        open={!!selectedItemForDetails}
        onClose={() => setSelectedItemForDetails(null)}
        moduleName="Item"
        mode="details"
        data={selectedItemForDetails ? { id: selectedItemForDetails.itemId || selectedItemForDetails.id } : null}
      />

      <SideDrawer
        open={!!selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        moduleName="ProductionOrder"
        mode="details"
        data={selectedOrderForDetails ? { id: selectedOrderForDetails.productionOrderId || selectedOrderForDetails.id } : null}
      />

      <SideDrawer
        open={!!selectedBomForDetails}
        onClose={() => setSelectedBomForDetails(null)}
        moduleName="Bom"
        mode="details"
        data={selectedBomForDetails ? { id: selectedBomForDetails.bomId || selectedBomForDetails.id } : null}
      />

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails ? { id: selectedUserForDetails.addedBy || selectedUserForDetails.id } : null}
      />
    </>
  );
}
