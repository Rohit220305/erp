import { Layers } from "lucide-react";

export const bomDrawerConfig = {
  title: "BOM Details",
  header: {
    image: { 
      key: "imageUrl", 
      fallbackType: "icon", 
      fallbackIcon: Layers
    },
    title: { 
      type: "text", 
      key: "bomName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "BOM_VIEW",
    path: "/bom/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "BOM Name", key: "bomName", type: "text" },
        { label: "BOM Code", key: "bomCode", type: "text" },
        { label: "Production Method", key: "productionMethod", type: "text" },
        { label: "Output Item", key: "itemName", type: "text" },
        { label: "Process Template", key: "processTemplateName", type: "text" },
        { label: "Cost Per Unit", key: "costPerUnitFormatted", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true }
      ]
    },
    {
      title: "Process List",
      type: "listArray",
      arrayKey: "processStages",
      listConfig: {
        titleKey: "processName",
        subtitleKey: "processCode",
        linkPath: "/process/{processId}"
      }
    }
  ]
};
