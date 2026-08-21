import { Warehouse } from "lucide-react";

export const storageDrawerConfig = {
  title: "Storage Details",
  header: {
    image: { 
      key: "imageUrl", 
      fallbackType: "icon", 
      fallbackIcon: Warehouse
    },
    title: { 
      type: "text", 
      key: "storageName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "STORAGE_VIEW",
    path: "/storage/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Storage Name", key: "storageName", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Storage Code", key: "storageCode", type: "text" },
        { label: "Description", key: "description", type: "longText" }
      ]
    }
  ]
};
