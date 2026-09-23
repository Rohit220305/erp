"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";

import { formatNumber } from "@/utils/number-formatter";
import { displayFormat } from "@/utils/no-data-formatter";

export default function ProductionBatchListCard({
  item,
  config,
  onRowAction,
  setSelectedBatchForDetails,
  setSelectedItemForDetails,
  setSelectedOrderForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!item) return null;



  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-5 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Batch Code
              </p>
              <ModuleLink
                moduleName="ProductionBatch"
                id={item.id || item.productionBatchId || item.batchId}
                className="font-bold text-sm text-[#1565c0] hover:underline block truncate"
                onOpenDrawer={
                  setSelectedBatchForDetails
                    ? () => setSelectedBatchForDetails(item)
                    : null
                }
              >
                {displayFormat(item.batchCode)}
              </ModuleLink>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Production Order
              </p>
              <ModuleLink
                moduleName="ProductionOrder"
                id={item.productionOrderId}
                className="font-medium text-[13px] text-[#1565c0] hover:underline block truncate"
                onOpenDrawer={
                  setSelectedOrderForDetails
                    ? () =>
                      setSelectedOrderForDetails({
                        productionOrderId: item.productionOrderId,
                      })
                    : null
                }
              >
                {displayFormat(item.productionOrderCode)}
              </ModuleLink>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Item Name
              </p>
              <ModuleLink
                moduleName="Item"
                id={item.itemId}
                className="font-medium text-[13px] text-[#1565c0] hover:underline block truncate"
                onOpenDrawer={
                  setSelectedItemForDetails
                    ? () => setSelectedItemForDetails({ itemId: item.itemId })
                    : null
                }
              >
                {displayFormat(item.itemName)}
              </ModuleLink>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Batch Qty
              </p>
              <div className="text-[13px] text-gray-900 font-bold font-mono truncate">
                {item.batchQuantityFormatted || formatNumber(item.batchQuantity)}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <StatusBadge
                status={displayFormat(item.status)}
                module="production-batch"
              />
            </div>
          </div>

          <div
            className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-400 ${isExpanded ? "rotate-180" : ""
                }`}
              size={20}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-4 items-start pr-[52px]">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  BOM Name
                </p>
                <ModuleLink
                  moduleName="Bom"
                  id={item.bomId}
                  className="font-medium text-[13px] text-[#1565c0] hover:underline font-mono block truncate"
                  onOpenDrawer={
                    setSelectedBomForDetails
                      ? () => setSelectedBomForDetails({ bomId: item.bomId })
                      : null
                  }
                >
                  {displayFormat(item.bomName)}
                </ModuleLink>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Material Status
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.materialStatus)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Created By
                </p>
                <ModuleLink
                  moduleName="User"
                  id={item.addedBy}
                  className="font-medium text-[13px] text-[#1565c0] hover:underline block truncate"
                  onOpenDrawer={
                    setSelectedUserForDetails
                      ? () =>
                        setSelectedUserForDetails({ addedBy: item.addedBy })
                      : null
                  }
                >
                  {displayFormat(item.addedByName)}
                </ModuleLink>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Created Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.addedDateFormatted, "DATE")}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Customer Name
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.customerName)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
