import { Boxes } from "lucide-react";

export const itemCategoryDrawerConfig = {
  title: "Item Category Details",
  header: {
    // image: { 
    //   key: "imageUrl", 
    //   fallbackType: "icon", 
    //   fallbackIcon: Boxes
    // },
    title: { 
      type: "text", 
      key: "categoryName" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "ITEM_CATEGORY_VIEW",
    path: "/item-category/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Category Name", key: "categoryName", type: "text" },
        { label: "Company", key: "companyName", type: "text", showForSuperAdminOnly: true },
        { label: "Category Code", key: "categoryCode", type: "text" },
        { label: "Storage types", key: "storageNames", type: "text" },
        { label: "Reference Code", key: "referenceCode", type: "text" }
      ]
    }
  ]
};
