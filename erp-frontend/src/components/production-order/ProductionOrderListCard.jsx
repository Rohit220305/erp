"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";

export default function ProductionOrderListCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-5 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Production Request
              </p>
              {canViewOrder ? (
                <ModuleLink
                  href={buildRoute("production-order", "detail", { id: item.id })}
                  onClick={setSelectedItemForDetails ? () => setSelectedItemForDetails(item) : null}
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-bold text-sm truncate"
                >
                  {item.productionOrderCode || "—"}
                </ModuleLink>
              ) : (
                <p className="text-sm font-bold text-gray-800 truncate">
                  {item.productionOrderCode || "—"}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Production Item
              </p>
              {canViewItem && item.itemId ? (
                <ModuleLink
                  href={buildRoute("item", "detail", { id: item.itemId })}
                  onClick={setSelectedOutputItemForDetails ? () => setSelectedOutputItemForDetails({ itemId: item.itemId, id: item.itemId }) : null}
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                >
                  {item.itemName || "—"}
                </ModuleLink>
              ) : (
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.itemName || "—"}
                </div>
              )}
              <p className="text-[11px] font-mono text-gray-400 mt-0.5 truncate">
                {item.itemCode || "—"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                BOM
              </p>
              {canViewBom && item.bomId ? (
                <ModuleLink
                  href={buildRoute("bom", "detail", { id: item.bomId })}
                  onClick={setSelectedBomForDetails ? () => setSelectedBomForDetails({ bomId: item.bomId, id: item.bomId }) : null}
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] font-mono truncate"
                >
                  {item.bomCode || item.bomName || "—"}
                </ModuleLink>
              ) : (
                <div className="text-[13px] text-gray-800 font-medium font-mono truncate">
                  {item.bomCode || item.bomName || "—"}
                </div>
              )}
            </div>

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

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <StatusBadge status={item.status || "—"} />
            </div>
          </div>

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

        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-4 items-start pr-[52px]">
              <div className="min-w-0">
                {/* <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  No. of Batches
                </p>
                <div className="text-[13px] font-mono text-gray-800 font-medium truncate">
                  {item.batchCount || 0}
                </div> */}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Production Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.productionDateFormatted || "—"}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Request By
                </p>
                {(() => {
                  const userId = item.addedBy || item.addedById || item.added_by || item.createdBy;
                  return canViewUser ? (
                    <ModuleLink
                      href={userId ? buildRoute("user", "detail", { id: userId }) : buildRoute("user", "list")}
                      onClick={setSelectedUserForDetails && userId ? () => setSelectedUserForDetails({ addedBy: userId, userId, id: userId }) : null}
                      className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                    >
                      {item.addedByName || "—"}
                    </ModuleLink>
                  ) : (
                    <div className="text-[13px] text-gray-800 font-medium truncate">
                      {item.addedByName || "—"}
                    </div>
                  );
                })()}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Added Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.addedDateFormatted || "—"}
                </div>
              </div>

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
