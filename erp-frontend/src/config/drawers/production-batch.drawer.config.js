import { Layers } from "lucide-react";

export const productionBatchDrawerConfig = {
  title: "Production Batch Details",
  header: {
    title: {
      type: "text",
      key: "batchCode",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "PRODUCTION_BATCH_VIEW",
    path: "/production-batch/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Batch Code", key: "batchCode", type: "text" },
        {
          label: "Production Order",
          key: "productionOrderCode",
          type: "drawerLink",
          drawerModule: "ProductionOrder",
          drawerIdKey: "productionOrderId",
        },
        {
          label: "Item Name",
          key: "itemName",
          type: "drawerLink",
          drawerModule: "Item",
          drawerIdKey: "itemId",
        },
        {
          label: "BOM Name",
          key: "bomName",
          type: "drawerLink",
          drawerModule: "Bom",
          drawerIdKey: "bomId",
        },
        { label: "Batch Quantity", key: "batchQuantity", type: "text" },
        { label: "Material Status", key: "materialStatus", type: "text" },
        {
          label: "Requested By",
          key: "addedByName",
          type: "drawerLink",
          drawerModule: "User",
          drawerIdKey: "addedBy",
        },
        { label: "Requested Date", key: "addedDateFormatted", type: "text" },
      ],
    },
  ],
};
