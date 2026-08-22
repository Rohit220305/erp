"use client";

import DynamicListing from "@/components/common/dynamic/DynamicListing";
import processTemplateConfig from "@/config/process-template.config.json";
import {
  listProcessTemplates,
  getProcessTemplate,
  deleteProcessTemplate,
} from "@/lib/api/process-template-api";
import ProcessTemplateTableRow from "./ProcessTemplateTableRow";

export default function ProcessTemplateListing() {
  const customConfig = {
    ...processTemplateConfig,
    forceView: "table",
    headerIcons: ["refresh", "search", "filter", "filterDrawer"],
  };

  return (
    <DynamicListing
      schema={customConfig}
      fetchData={listProcessTemplates}
      fetchItem={getProcessTemplate}
      deleteFn={deleteProcessTemplate}
      renderTableRow={(item, onRowAction, setSelectedItemForDetails) => (
        <ProcessTemplateTableRow
          item={item}
          onRowAction={onRowAction}
          setSelectedItemForDetails={setSelectedItemForDetails}
        />
      )}
    />
  );
}
