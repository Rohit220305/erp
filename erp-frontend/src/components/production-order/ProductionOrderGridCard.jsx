"use client";

import { Package, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";

export default function ProductionOrderGridCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCategoryForDetails, // Item drawer
  setSelectedCompanyForDetails,  // BOM drawer
  setSelectedUserForDetails,     // User drawer
}) {
  const router = useRouter();
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

  const userInitial = item.addedByName ? item.addedByName.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#1565c0]" />
          {canViewOrder && setSelectedItemForDetails ? (
            <button
              type="button"
              onClick={() => setSelectedItemForDetails(item)}
              className="font-bold text-sm text-[#1565c0] hover:underline cursor-pointer"
            >
              {item.productionOrderCode}
            </button>
          ) : (
            <span className="font-bold text-sm text-gray-800">
              {item.productionOrderCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${getStatusColor(
              item.status,
            )}`}
          >
            {item.status}
          </span>
        </div>
      </div>

      {/* Item Info */}
      <div>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
          Production Item
        </span>
        {canViewItem && setSelectedCategoryForDetails ? (
          <button
            type="button"
            onClick={() =>
              setSelectedCategoryForDetails({ itemId: item.itemId })
            }
            className="text-xs font-bold text-[#1565c0] hover:underline cursor-pointer block"
          >
            {item.itemName}
          </button>
        ) : (
          <span className="text-xs font-bold text-gray-800 block">
            {item.itemName}
          </span>
        )}
        <span className="text-[11px]  text-gray-400">{item.itemCode}</span>
      </div>

      {/* Key-Value Data (Left Title, Right Value) */}
      <div className="space-y-2.5 text-xs py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Production Date</span>
          <div className="font-semibold text-gray-800  w-50">
            {item.productionDateFormatted || "-"}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">No. of Batches</span>
          <div className="font-semibold text-gray-800  w-50">
            {item.batchCount || 0}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">BOM</span>
          <div className="font-semibold text-gray-800  w-50">
            {canViewBom && setSelectedCompanyForDetails ? (
              <button
                type="button"
                onClick={() =>
                  setSelectedCompanyForDetails({ bomId: item.bomId })
                }
                className="font-semibold text-[#1565c0] hover:underline cursor-pointer "
              >
                {item.bomCode || item.bomName || "-"}
              </button>
            ) : (
              <span className="font-semibold text-gray-800 ">
                {item.bomCode || item.bomName || "-"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Quantities Bar */}
      <div className="  p-3 flex items-center justify-between text-xs  border-t border-gray-100 ">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">
            Produced Qty
          </span>
          <span className="font-bold text-gray-900">
            {item.productionQuantityDisplay}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">
            Package Qty
          </span>
          <span className="font-bold text-gray-900">
            {item.packageQuantityDisplay}
          </span>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="flex  items-center justify-between pt-2 border-t border-gray-100 text-xs ">
        <div className="flex items-center gap-2 bg-gray-100  w-full rounded-lg px-3 py-4">
          <div className="w-7 h-7 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {userInitial}
          </div>
          <div>
            {canViewUser && setSelectedUserForDetails ? (
              <button
                type="button"
                onClick={() =>
                  setSelectedUserForDetails({ addedBy: item.addedBy })
                }
                className="font-medium text-[#1565c0] hover:underline cursor-pointer"
              >
                {item.addedByName || "-"}
              </button>
            ) : (
              <span className="font-medium text-gray-800">
                {item.addedByName || "-"}
              </span>
            )}
            <p className="text-[10px] text-gray-400">
              {item.addedDateFormatted}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
      </div>
    </div>
  );
}
