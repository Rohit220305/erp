"use client";

import { useState } from "react";
import DynamicListing from "@/components/common/dynamic/DynamicListing";
import SideDrawer from "@/components/common/SideDrawer";
import processTemplateConfig from "@/config/process-template.config.json";
import {
  listProcessTemplates,
  getProcessTemplate,
  deleteProcessTemplate,
} from "@/lib/api/process-template-api";
import ProcessTemplateTableRow from "./ProcessTemplateTableRow";

export default function ProcessTemplateListing() {
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);

  const customConfig = {
    ...processTemplateConfig,
    forceView: "table",
    headerIcons: ["refresh", "search", "filter", "filterDrawer"],
  };

  return (
    <>
      <DynamicListing
        schema={customConfig}
        fetchData={listProcessTemplates}
        fetchItem={getProcessTemplate}
        deleteFn={deleteProcessTemplate}
        renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
          <ProcessTemplateTableRow
            key={item.id}
            item={item}
            onRowAction={onRowAction}
            setSelectedItemForDetails={setSelectedItemForDetails}
            setSelectedCompanyForDetails={setSelectedCompanyForDetails}
          />
        )}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />
    </>
  );
}
