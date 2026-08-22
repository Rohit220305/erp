import { Activity } from "lucide-react";

export const processDrawerConfig = {
  title: "Process Details",
  header: {
    image: {
      key: "imageUrl",
      fallbackType: "icon",
      fallbackIcon: Activity
    },
    title: {
      type: "text",
      key: "processName"
    },
    badge: {
      key: "status",
      type: "statusBadge"
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "PROCESS_VIEW",
    path: "/process/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Process Name", key: "processName", type: "text" },
        { label: "Process Code", key: "processCode", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Work Centre", key: "workCentreName", type: "text" }
      ]
    }
  ]
};
