"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";

export default function ProductionOrderListCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCategoryForDetails, // Item drawer
  setSelectedCompanyForDetails,  // BOM drawer
  setSelectedUserForDetails,     // User drawer
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "In Progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Draft":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "PartialCancelled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        {/* Main Bar */}
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-5 gap-4 items-center flex-1 min-w-0">
            {/* Col 1: Production Request Code */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Production Request
              </p>
              {canViewOrder && setSelectedItemForDetails ? (
                <span
                  onClick={() => setSelectedItemForDetails(item)}
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-bold text-sm truncate"
                >
                  {item.productionOrderCode || "—"}
                </span>
              ) : (
                <p className="text-sm font-bold text-gray-800 truncate">
                  {item.productionOrderCode || "—"}
                </p>
              )}
            </div>

            {/* Col 2: Production Item */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Production Item
              </p>
              {canViewItem && setSelectedCategoryForDetails ? (
                <span
                  onClick={() => setSelectedCategoryForDetails({ itemId: item.itemId })}
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                >
                  {item.itemName || "—"}
                </span>
              ) : (
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.itemName || "—"}
                </div>
              )}
              <p className="text-[11px] font-mono text-gray-400 mt-0.5 truncate">
                {item.itemCode || "—"}
              </p>
            </div>

            {/* Col 3: BOM */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                BOM
              </p>
              {canViewBom && setSelectedCompanyForDetails ? (
                <span
                  onClick={() => setSelectedCompanyForDetails({ bomId: item.bomId })}
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] font-mono truncate"
                >
                  {item.bomCode || item.bomName || "—"}
                </span>
              ) : (
                <div className="text-[13px] text-gray-800 font-medium font-mono truncate">
                  {item.bomCode || item.bomName || "—"}
                </div>
              )}
            </div>

            {/* Col 4: Produced Qty */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Produced Qty
              </p>
              <div className="text-[13px] text-gray-900 font-bold font-mono truncate">
                {item.productionQuantityDisplay || "—"}
              </div>
              <p className="text-[11px] font-mono text-gray-500 mt-0.5 truncate">
                {item.packageQuantityDisplay || "—"}
              </p>
            </div>

            {/* Col 5: Status */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    item.status,
                  )}`}
                >
                  {item.status || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Accordion Toggle Icon */}
          <div
            className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-400 ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={20}
            />
          </div>
        </div>

        {/* Expanded Drawer Details */}
        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-4 items-start pr-[52px]">
              {/* Batches */}
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  No. of Batches
                </p>
                <div className="text-[13px] font-mono text-gray-800 font-medium truncate">
                  {item.batchCount || 0}
                </div>
              </div>

              {/* Production Date */}
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Production Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.productionDateFormatted || "—"}
                </div>
              </div>

              {/* Request By */}
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Request By
                </p>
                {canViewUser && setSelectedUserForDetails ? (
                  <span
                    onClick={() => setSelectedUserForDetails({ addedBy: item.addedBy })}
                    className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                  >
                    {item.addedByName || "—"}
                  </span>
                ) : (
                  <div className="text-[13px] text-gray-800 font-medium truncate">
                    {item.addedByName || "—"}
                  </div>
                )}
              </div>

              {/* Added Date */}
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Added Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.addedDateFormatted || "—"}
                </div>
              </div>

              {/* Reference Number */}
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Reference No.
                </p>
                <div className="text-[13px] font-mono text-gray-800 font-medium truncate">
                  {item.referenceNumber || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
