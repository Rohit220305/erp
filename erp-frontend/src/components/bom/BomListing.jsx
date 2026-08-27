"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import BomTableRow from "@/components/bom/BomTableRow";
import BomListCard from "@/components/bom/BomListCard";
import BomGridCard from "@/components/bom/BomGridCard";
import bomConfig from "@/config/bom.config.json";
import { listBoms, getBom, deleteBom } from "@/lib/api/bom-api";
import SideDrawer from "@/components/common/SideDrawer";

export default function BomListing() {
  const [selectedOutputItemForDetails, setSelectedOutputItemForDetails] = useState(null);
  const [selectedProcessTemplateForDetails, setSelectedProcessTemplateForDetails] = useState(null);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);

  return (
    <>
      <DynamicListing
        schema={bomConfig}
        fetchData={listBoms}
        fetchItem={getBom}
        deleteFn={deleteBom}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <BomTableRow
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedOutputItemForDetails={setSelectedOutputItemForDetails}
            setSelectedProcessTemplateForDetails={setSelectedProcessTemplateForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
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
          />
        )}
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
    </>
  );
}
