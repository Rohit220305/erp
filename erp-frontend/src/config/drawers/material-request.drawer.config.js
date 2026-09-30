import { Package } from "lucide-react";

export const materialRequestDrawerConfig = {
  title: "Material Request Details",
  header: {
    title: {
      type: "text",
      key: "code",
    },
    badge: {
      key: "status",
      type: "statusBadge",
    },
  },
  primaryAction: {
    label: "More Details",
    permission: "MATERIAL_REQUEST_VIEW",
    path: "/material-request/{id}",
  },
  sections: [
    {
      title: null,
      fields: [
        { label: "Request Code", key: "code", type: "text" },
        { label: "Plant", key: "plantName", type: "text" },
        { label: "Warehouse", key: "warehouseName", type: "text" },
        {
          label: "Production Batch",
          key: "batchCode",
          type: "drawerLink",
          drawerModule: "ProductionBatch",
          drawerIdKey: "productionBatchId",
        },
        {
          label: "Requested By",
          key: "requestedByName",
          type: "drawerLink",
          drawerModule: "User",
          drawerIdKey: "requestedBy",
        },
        { label: "Requested Date", key: "requestedDateFormatted", type: "text" },
        { label: "Delivered Date", key: "deliveredDateFormatted", type: "text" },
        { label: "Total Requested Qty", key: "requestedQtySumFormatted", type: "text" },
        { label: "Remarks", key: "remark", type: "text" },
      ],
    },
  ],
};
