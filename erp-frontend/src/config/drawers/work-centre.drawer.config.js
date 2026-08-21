import { Factory } from "lucide-react";

export const workCentreDrawerConfig = {
  title: "Work Centre Details",
  header: {
    image: { 
      key: "imageUrl", 
      fallbackType: "icon", 
      fallbackIcon: Factory
    },
    title: { 
      type: "text", 
      key: "workCentreName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "WORK_CENTRE_VIEW",
    path: "/work-centre/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Work Centre Name", key: "workCentreName", type: "text" },
        { label: "Work Centre Code", key: "workCentreCode", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Category", key: "categoryName", type: "text" },
        { label: "Usage Status", key: "usageStatus", type: "text" }
      ]
    }
  ]
};
