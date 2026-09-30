import { Building2 } from "lucide-react";

export const customerCompanyDrawerConfig = {
  title: "Customer Details",
  header: {
    image: { 
      key: "logoUrl", 
      fallbackType: "icon", 
      fallbackIcon: Building2
    },
    title: { 
      type: "text", 
      key: "name" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "CUSTOMER_COMPANY_VIEW",
    path: "/customer-company/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Customer Name", key: "name", type: "text" },
        { label: "Customer Code", key: "code", type: "text" },
        { label: "Email", key: "email", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true }
      ]
    }
  ]
};
