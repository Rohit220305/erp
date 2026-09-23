import { Package } from "lucide-react";

export const productionOrderDrawerConfig = {
  title: "Production Order Details",
  header: {
    image: { 
      key: "itemImageUrl", 
      fallbackType: "icon", 
      fallbackIcon: Package
    },
    title: { 
      type: "text", 
      key: "productionOrderCode" 
    },
    badge: { 
      key: "status", 
      type: "statusBadge" 
    }
  },
  primaryAction: {
    label: "More Details",
    permission: "PRODUCTION_ORDER_VIEW",
    path: "/production-order/{id}"
  },
  sections: [
    {
      title: null,
      fields: [
        { 
          label: "Production Item", 
          key: "itemName", 
          type: "drawerLink",
          drawerModule: "Item",
          drawerIdKey: "itemId"
        },
        { label: "Item Code", key: "itemCode", type: "text" },
        { 
          label: "Bill of Material", 
          key: "bomName", 
          type: "drawerLink",
          drawerModule: "Bom",
          drawerIdKey: "bomId"
        },
        { label: "Production Method", key: "productionMethod", type: "text" },
        { label: "Production Qty", key: "productionQuantityDisplay", type: "text" },
        { label: "Pending Qty", key: "pendingQuantityDisplay", type: "text" },
        { label: "Package Qty", key: "packageQuantityDisplay", type: "text" },
        { label: "Item Cost Per Unit", key: "itemCostPerUnitFormatted", type: "text" },
        { label: "Estimated Total Cost", key: "estimatedTotalCostFormatted", type: "text" },
        { label: "Production Date", key: "productionDateFormatted", type: "text" },
        { label: "Added By", key: "addedByName", type: "text" },
        { label: "Added Date", key: "addedDateFormatted", type: "text" }
      ]
    }
  ]
};
