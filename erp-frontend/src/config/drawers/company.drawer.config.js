import { Building2 } from "lucide-react";

export const companyDrawerConfig = {
  title: "Company Details",
  header: {
    image: { 
      key: "logoUrl", 
      fallbackType: "icon", 
      fallbackIcon: Building2
    },
    title: { 
      type: "text", 
      key: "companyName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "COMPANY_VIEW",
    path: "/company/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Short Name", key: "shortName", type: "text" },
        { label: "Email", key: "email", type: "text" },
        { 
          label: "Phone", 
          type: "compositeText", 
          keys: ["dialCode", "phone"], 
          separator: " " 
        },
        { label: "Contact Person", key: "contactPersonName", type: "text" },
        { label: "Legal Name", key: "legalName", type: "text" },
        { label: "Website", key: "website", type: "text" }
      ]
    }
  ]
};
