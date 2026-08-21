import { Tag } from "lucide-react";

export const brandDrawerConfig = {
  title: "Brand Details",
  header: {
    image: { 
      key: "imageUrl", 
      fallbackType: "icon", 
      fallbackIcon: Tag
    },
    title: { 
      type: "text", 
      key: "brandName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "BRAND_VIEW",
    path: "/brand/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Brand Name", key: "brandName", type: "text" },
        { label: "Brand Code", key: "brandCode", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Manufacturer", key: "manufacturerName", type: "text" }
      ]
    }
  ]
};
