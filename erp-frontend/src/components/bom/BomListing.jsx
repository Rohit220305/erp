"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import BomTableRow from "@/components/bom/BomTableRow";
import BomListCard from "@/components/bom/BomListCard";
import BomGridCard from "@/components/bom/BomGridCard";
import bomConfig from "@/config/bom.config.json";
import { listBoms, getBom, deleteBom } from "@/lib/api/bom-api";
import SideDrawer from "@/components/common/SideDrawer";
import BomCloneDrawer from "@/components/bom/BomCloneDrawer";

export default function BomListing() {
  const [selectedOutputItemForDetails, setSelectedOutputItemForDetails] = useState(null);
  const [selectedProcessTemplateForDetails, setSelectedProcessTemplateForDetails] = useState(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const [isCloneOpen, setIsCloneOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCloneSuccess = () => {
    setIsCloneOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <DynamicListing
        key={refreshKey}
        schema={bomConfig}
        fetchData={listBoms}
        fetchItem={getBom}
        deleteFn={deleteBom}
        extraNavButtons={[
          {
            label: "Clone BOM",
            onClick: () => setIsCloneOpen(true),
          },
        ]}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <BomTableRow
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOutputItemForDetails={setSelectedOutputItemForDetails}
            setSelectedProcessTemplateForDetails={setSelectedProcessTemplateForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
        renderListCard={(item, setSelectedItemForDetails) => (
          <BomListCard
            key={item.id}
            item={item}
            config={bomConfig}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOutputItemForDetails={setSelectedOutputItemForDetails}
            setSelectedProcessTemplateForDetails={setSelectedProcessTemplateForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
        renderGridCard={(item, setSelectedItemForDetails) => (
          <BomGridCard
            key={item.id}
            item={item}
            config={bomConfig}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOutputItemForDetails={setSelectedOutputItemForDetails}
            setSelectedProcessTemplateForDetails={setSelectedProcessTemplateForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
            setSelectedUserForDetails={setSelectedUserForDetails}
          />
        )}
      />

      <BomCloneDrawer
        open={isCloneOpen}
        onClose={() => setIsCloneOpen(false)}
        onSuccess={handleCloneSuccess}
      />

      <SideDrawer
        open={!!selectedOutputItemForDetails}
        onClose={() => setSelectedOutputItemForDetails(null)}
        moduleName="Item"
        mode="details"
        data={selectedOutputItemForDetails ? { id: selectedOutputItemForDetails.id || selectedOutputItemForDetails.categoryId } : null}
      />

      <SideDrawer
        open={!!selectedProcessTemplateForDetails}
        onClose={() => setSelectedProcessTemplateForDetails(null)}
        moduleName="ProcessTemplate"
        mode="details"
        data={selectedProcessTemplateForDetails ? { id: selectedProcessTemplateForDetails.id } : null}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId || selectedCompanyForDetails.id } : null}
      />

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails ? { id: selectedUserForDetails.id || selectedUserForDetails.userId || selectedUserForDetails.addedBy } : null}
      />
    </>
  );
}
