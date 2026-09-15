"use client";

import { Package, Copy, Users } from "lucide-react";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";

import { formatNumber } from "@/utils/number-formatter";

export default function ProductionBatchGridCard({
  item,
  setSelectedBatchForDetails,
  setSelectedItemForDetails,
  setSelectedOrderForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
}) {
  if (!item) return null;

  const userInitial = item.addedByName ? item.addedByName.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ModuleLink
            moduleName="ProductionBatch"
            id={item.id || item.productionBatchId || item.batchId}
            className="font-bold text-sm text-[#1565c0] hover:underline"
            onOpenDrawer={
              setSelectedBatchForDetails
                ? () => setSelectedBatchForDetails(item)
                : null
            }
          >
            {item.batchCode}
          </ModuleLink>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={item.status || "Pending"}
            module="production-batch"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
            Production Order
          </span>
          <ModuleLink
            moduleName="ProductionOrder"
            id={item.productionOrderId}
            className="text-xs font-bold text-[#1565c0] hover:underline block"
            onOpenDrawer={
              setSelectedOrderForDetails
                ? () =>
                    setSelectedOrderForDetails({
                      productionOrderId: item.productionOrderId,
                    })
                : null
            }
          >
            {item.productionOrderCode || "—"}
          </ModuleLink>
        </div>
        <div className="pt-1">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
            Production Item
          </span>
          <ModuleLink
            moduleName="Item"
            id={item.itemId}
            className="text-xs font-bold text-[#1565c0] hover:underline block truncate text-left w-full"
            onOpenDrawer={
              setSelectedItemForDetails
                ? () => setSelectedItemForDetails({ itemId: item.itemId })
                : null
            }
            title={item.itemName}
          >
            {item.itemName || "—"}
          </ModuleLink>
        </div>
      </div>

      <div className="space-y-2 text-xs pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">BOM Name</span>
          <ModuleLink
            moduleName="Bom"
            id={item.bomId}
            className="font-medium text-[#1565c0] hover:underline font-mono truncate max-w-[140px]"
            onOpenDrawer={
              setSelectedBomForDetails
                ? () => setSelectedBomForDetails({ bomId: item.bomId })
                : null
            }
            title={item.bomName}
          >
            {item.bomName || "—"}
          </ModuleLink>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Batch Quantity</span>
          <span className="font-medium font-mono text-gray-500">
            {formatNumber(item.batchQuantity || 0)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2 bg-gray-100 w-full rounded-lg px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <ModuleLink
              moduleName="User"
              id={item.addedBy}
              className="font-medium text-[#1565c0] hover:underline text-xs truncate block"
              onOpenDrawer={
                setSelectedUserForDetails
                  ? () => setSelectedUserForDetails({ addedBy: item.addedBy })
                  : null
              }
            >
              {item.addedByName || "System"}
            </ModuleLink>
            <p className="text-[10px] text-gray-400">
              {item.addedDateFormatted || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
