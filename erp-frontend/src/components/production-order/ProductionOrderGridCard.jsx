"use client";

import { Package, Eye, Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";

export default function ProductionOrderGridCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
}) {
  const router = useRouter();
  const { can } = useAuth();

  if (!item) return null;

  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canCreateBatch = can(CAPABILITIES.PRODUCTION_BATCH?.CREATE || "PRODUCTION_BATCH_CREATE");



  const userId = item.addedBy || item.addedById || item.added_by || item.createdBy;
  const userInitial = item.addedByName ? item.addedByName.charAt(0).toUpperCase() : "U";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#1565c0]" />
          {canViewOrder ? (
            <ModuleLink
              href={buildRoute("production-order", "detail", { id: item.id })}
              onClick={setSelectedItemForDetails ? () => setSelectedItemForDetails(item) : null}
              className="font-bold text-sm text-[#1565c0] hover:underline cursor-pointer"
            >
              {item.productionOrderCode}
            </ModuleLink>
          ) : (
            <span className="font-bold text-sm text-gray-800">
              {item.productionOrderCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
            Production Item
          </span>
          {canViewItem && item.itemId ? (
            <ModuleLink
              href={buildRoute("item", "detail", { id: item.itemId })}
              onClick={setSelectedOutputItemForDetails ? () => setSelectedOutputItemForDetails({ itemId: item.itemId, id: item.itemId }) : null}
              className="text-xs font-bold text-[#1565c0] hover:underline cursor-pointer block"
            >
              {item.itemName}
            </ModuleLink>
          ) : (
            <span className="text-xs font-bold text-gray-800 block">
              {item.itemName}
            </span>
          )}
          <span className="text-[11px]  text-gray-400">{item.itemCode}</span>
        </div>
        {canCreateBatch && (
          <div className="ml-2 shrink-0">
            <button
              onClick={() => router.push(`/production-batch/create/${item.id}`)}
              className="bg-white border border-[#1565c0] text-[#1565c0] font-medium text-xs py-1.5 px-3 rounded hover:bg-blue-50 transition whitespace-nowrap cursor-pointer"
            >
              Create Batch
            </button>
          </div>
        )}
      </div>

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
            {canViewBom && item.bomId ? (
              <ModuleLink
                href={buildRoute("bom", "detail", { id: item.bomId })}
                onClick={setSelectedBomForDetails ? () => setSelectedBomForDetails({ bomId: item.bomId, id: item.bomId }) : null}
                className="font-semibold text-[#1565c0] hover:underline cursor-pointer "
              >
                {item.bomCode || item.bomName || "-"}
              </ModuleLink>
            ) : (
              <span className="font-semibold text-gray-800 ">
                {item.bomCode || item.bomName || "-"}
              </span>
            )}
          </div>
        </div>
      </div>

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

      <div className="flex  items-center justify-between pt-2 border-t border-gray-100 text-xs ">
        <div className="flex items-center gap-2 bg-gray-100  w-full rounded-lg px-3 py-4">
          <div className="w-7 h-7 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            {userInitial}
          </div>
          <div>
            {canViewUser ? (
              <ModuleLink
                href={userId ? buildRoute("user", "detail", { id: userId }) : buildRoute("user", "list")}
                onClick={setSelectedUserForDetails && userId ? () => setSelectedUserForDetails({ addedBy: userId, userId, id: userId }) : null}
                className="font-medium text-[#1565c0] hover:underline cursor-pointer"
              >
                {item.addedByName || "-"}
              </ModuleLink>
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
      </div>
    </div>
  );
}
