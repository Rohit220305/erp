import { Package } from "lucide-react";

export const itemDrawerConfig = {
  title: "Item Details",
  header: {
    image: {
      key: "primaryImageUrl",
      fallbackType: "icon",
      fallbackIcon: Package,
    },
    title: {
      type: "text",
      key: "itemName",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "ITEM_VIEW",
    path: "/item/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Item Name", key: "itemName", type: "text" },
        { label: "Item Code", key: "itemCode", type: "text" },
        { label: "Short Name", key: "shortName", type: "text" },
        { label: "Print Name", key: "printName", type: "text" },
        {
          label: "Company",
          key: "companyName",
          type: "text",
          showForSuperAdminOnly: true,
        },
        { label: "Barcode", key: "barcode", type: "text" },
        { label: "Shelf Life", key: "shelfLifeDisplay", type: "text" },
        { label: "Storage Details", key: "storageName", type: "text" },
            { label: "Usage Type", key: "usageType", type: "text" },
      ],
    },
   
  ],
};
