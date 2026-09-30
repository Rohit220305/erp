"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import materialRequestConfig from "@/config/material-request.config.json";
import {
  listMaterialRequests,
  getMaterialRequest,
  deleteMaterialRequest,
} from "@/lib/api/material-request-api";

import MaterialRequestTableRow from "./MaterialRequestTableRow";
import MaterialRequestListCard from "./MaterialRequestListCard";
import MaterialRequestGridCard from "./MaterialRequestGridCard";

export default function MaterialRequestListing() {
  const [selectedPlantForDetails, setSelectedPlantForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

  return (
    <>
      <DynamicListing
        schema={materialRequestConfig}
        fetchData={listMaterialRequests}
        fetchItem={getMaterialRequest}
        deleteFn={deleteMaterialRequest}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <MaterialRequestTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedPlantForDetails={setSelectedPlantForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
          />
        )}
        renderListCard={(item, setSelectedItemForDetails) => (
          <MaterialRequestListCard
            key={item.id}
            item={item}
            config={materialRequestConfig}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedPlantForDetails={setSelectedPlantForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
          />
        )}
        renderGridCard={(item, setSelectedItemForDetails) => (
          <MaterialRequestGridCard
            key={item.id}
            item={item}
            config={materialRequestConfig}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedPlantForDetails={setSelectedPlantForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
            setSelectedOrderForDetails={setSelectedOrderForDetails}
          />
        )}
      />

      <SideDrawer
        open={!!selectedPlantForDetails}
        onClose={() => setSelectedPlantForDetails(null)}
        moduleName="Plant"
        mode="details"
        data={
          selectedPlantForDetails
            ? { id: selectedPlantForDetails.plantId || selectedPlantForDetails.id }
            : null
        }
      />

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={
          selectedUserForDetails
            ? { id: selectedUserForDetails.userId || selectedUserForDetails.id }
            : null
        }
      />

      <SideDrawer
        open={!!selectedOrderForDetails}
        onClose={() => setSelectedOrderForDetails(null)}
        moduleName="ProductionOrder"
        mode="details"
        data={
          selectedOrderForDetails
            ? { id: selectedOrderForDetails.productionOrderId || selectedOrderForDetails.id }
            : null
        }
      />
    </>
  );
}
