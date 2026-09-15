

const MODULE_STATUS_OVERRIDES = {
  "production-batch": {
    Pending: { label: "Waiting for Stock", color: "text-amber-600 font-semibold", bg: "bg-amber-50" },
  },
};

export const STATUS_CONFIG = {

  // ProductionBatchStatus
  Pending: { label: "Pending", color: "text-amber-600 font-semibold", bg: "bg-amber-50" },
  StockReceived: { label: "Stock Received", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  "Stock Received": { label: "Stock Received", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  InProgress: { label: "In Progress", color: "text-purple-600 font-semibold", bg: "bg-purple-50" },
  "In Progress": { label: "In Progress", color: "text-purple-600 font-semibold", bg: "bg-purple-50" },
  Completed: { label: "Completed", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  Finished: { label: "Finished", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  Cancelled: { label: "Cancelled", color: "text-red-600 font-semibold", bg: "bg-red-50" },

  // ProductionBatchProcessStatus
  YetToStart: { label: "Yet to Start", color: "text-gray-500 font-semibold", bg: "bg-gray-100" },
  "Yet to Start": { label: "Yet to Start", color: "text-gray-500 font-semibold", bg: "bg-gray-100" },
  ReadyToStart: { label: "Ready to Start", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  ReadytoStart: { label: "Ready to Start", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  "Ready to Start": { label: "Ready to Start", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  Resumed: { label: "Resumed", color: "text-purple-600 font-semibold", bg: "bg-purple-50" },
  Paused: { label: "Paused", color: "text-yellow-600 font-semibold", bg: "bg-yellow-50" },
  Skipped: { label: "Skipped", color: "text-red-600 font-semibold", bg: "bg-red-50" },

  // MaterialStatus
  YetToOrder: { label: "Yet to Order", color: "text-purple-600 font-semibold", bg: "bg-purple-50" },
  "Yet to Order": { label: "Yet to Order", color: "text-purple-600 font-semibold", bg: "bg-purple-50" },
  OrderPlaced: { label: "Order Placed", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  "Order Placed": { label: "Order Placed", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  OrderReceived: { label: "Order Received", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  "Order Received": { label: "Order Received", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  OrderPartiallyReceived: { label: "Order Partially Received", color: "text-amber-600 font-semibold", bg: "bg-amber-50" },
  "Order Partially Received": { label: "Order Partially Received", color: "text-amber-600 font-semibold", bg: "bg-amber-50" },
  YetToRequest: { label: "Yet to Request", color: "text-orange-600 font-semibold", bg: "bg-orange-50" },
  "Yet to Request": { label: "Yet to Request", color: "text-orange-600 font-semibold", bg: "bg-orange-50" },
  PartiallyIssued: { label: "Partially Issued", color: "text-amber-600 font-semibold", bg: "bg-amber-50" },
  "Partially Issued": { label: "Partially Issued", color: "text-amber-600 font-semibold", bg: "bg-amber-50" },
  FullyIssued: { label: "Fully Issued", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  "Fully Issued": { label: "Fully Issued", color: "text-green-600 font-semibold", bg: "bg-green-50" },
  MaterialRequested: { label: "Material Requested", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  "Material Requested": { label: "Material Requested", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },

  // General Statuses
  InProduction: { label: "In Production", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  "In Production": { label: "In Production", color: "text-blue-600 font-semibold", bg: "bg-blue-50" },
  Draft: { label: "Draft", color: "text-gray-600 font-semibold", bg: "bg-gray-100" },
  Active: { label: "Active", color: "text-green-700 font-semibold", bg: "bg-green-100", dot: "bg-green-500" },
  Inactive: { label: "Inactive", color: "text-red-700 font-semibold", bg: "bg-red-100", dot: "bg-red-500" },
  PartialCancelled: { label: "Partially Cancelled", color: "text-yellow-800 font-semibold", bg: "bg-yellow-100" },
};


export function getStatusDisplay(st, module = null) {
  if (!st) return { label: "—", color: "text-gray-400 font-semibold", bg: "bg-gray-50" };

  // Check module-specific override first
  if (module && MODULE_STATUS_OVERRIDES[module]?.[st]) {
    return MODULE_STATUS_OVERRIDES[module][st];
  }

  if (STATUS_CONFIG[st]) {
    return STATUS_CONFIG[st];
  }

  const label = String(st).replace(/([a-z])([A-Z])/g, "$1 $2");
  return {
    label,
    color: "text-gray-600 font-semibold",
    bg: "bg-gray-100",
  };
}

export function formatStatusLabel(st, module = null) {
  return getStatusDisplay(st, module).label;
}
