import { GitBranch } from "lucide-react";

export const processTemplateDrawerConfig = {
  title: "Process Template Details",
  header: {
    image: { 
      key: "imageUrl", 
      fallbackType: "icon", 
      fallbackIcon: GitBranch
    },
    title: { 
      type: "text", 
      key: "templateName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "PROCESS_TEMPLATE_VIEW",
    path: "/process-template/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Template Name", key: "templateName", type: "text" },
        { label: "Template Code", key: "templateCode", type: "text" },
        { label: "Execution Type", key: "executionType", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true }
      ]
    }
  ]
};
