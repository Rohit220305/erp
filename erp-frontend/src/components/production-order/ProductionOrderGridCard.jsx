"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmModal from "@/components/common/ConfirmModal";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import { cancelProductionOrder } from "@/lib/api/production-order-api";
import { toast } from "react-hot-toast";

export default function ProductionOrderGridCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
  onRefresh,
}) {
  const { can } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdown(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (!item) return null;

  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canCreateBatch = can(CAPABILITIES.PRODUCTION_BATCH?.CREATE || "PRODUCTION_BATCH_CREATE");
  const canDeleteOrder = can(CAPABILITIES.PRODUCTION_ORDER?.DELETE || "PRODUCTION_ORDER_DELETE");
  const canEditOrder = can(CAPABILITIES.PRODUCTION_ORDER?.UPDATE || "PRODUCTION_ORDER_UPDATE");

  const canCancelOrder =
    canDeleteOrder &&
    (item.status === "Pending" ||
      (item.status === "InProgress" && Number(item.pendingQuantity) > 0));

  const isInactive = item.status === "Completed" || item.status === "Cancelled" || item.status === "PartialCancelled" || item.status === "Partially Cancelled";
  const canCreateBatchAction = canCreateBatch && !isInactive && Number(item.pendingQuantity ?? 1) > 0;
  const hasBatches = Number(item.batchCount) > 0;
  const canEditAction = canEditOrder && !hasBatches && !isInactive;

  const createBatchUrl = item.id
    ? `/production-batch/create/${item.id}`
    : "#";

  const editOrderUrl = item.id
    ? buildRoute("production-order", "edit", { id: item.id })
    : "#";

  const handleCancelOrder = async () => {
    setIsCancelModalOpen(false);
    setIsCancelling(true);
    try {
      const res = await cancelProductionOrder({ id: item.id });
      const success = res?.settings?.success === 1 || res?.success === 1;
      const msg = res?.settings?.message || res?.message;
      if (success) {
        toast.success(msg || "Production order cancelled successfully");
        window.location.reload();
      } else {
        toast.error(msg || "Failed to cancel production order");
      }
    } catch (err) {
      toast.error("An error occurred while cancelling order");
    } finally {
      setIsCancelling(false);
    }
  };

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
              {displayFormat(item.productionOrderCode)}
            </ModuleLink>
          ) : (
            <span className="font-bold text-sm text-gray-800">
              {displayFormat(item.productionOrderCode)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex items-center justify-between relative">
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
              {displayFormat(item.itemName)}
            </ModuleLink>
          ) : (
            <span className="text-xs font-bold text-gray-800 block">
              {displayFormat(item.itemName)}
            </span>
          )}
          <span className="text-[11px] text-gray-400">{displayFormat(item.itemCode)}</span>
        </div>

        {(canCreateBatchAction || canCancelOrder || canEditAction) && (
          <div className="ml-2 shrink-0 relative">
            <div className="flex rounded-md border border-[#1565c0] bg-white overflow-hidden shrink-0">
              {canCreateBatchAction ? (
                <Link
                  href={createBatchUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 text-xs font-medium text-[#1565c0] hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center"
                >
                  Create Batch
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium text-gray-500 whitespace-nowrap flex items-center">
                  Actions
                </span>
              )}

              {(canCancelOrder || canEditAction) && (
                <button
                  type="button"
                  className="px-2 border-l cursor-pointer border-[#1565c0] text-[#1565c0] hover:bg-blue-50 transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown((prev) => !prev);
                  }}
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ease-in-out ${openDropdown ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>
              )}
            </div>

            {openDropdown && (canCancelOrder || canEditAction) && (
              <div
                className="absolute top-full right-0 mt-1.5 bg-white border border-[#1565c0] rounded-md shadow-lg z-20 w-36 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {canCancelOrder && (
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1565c0] transition-colors cursor-pointer whitespace-nowrap"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(false);
                      setIsCancelModalOpen(true);
                    }}
                  >
                    Cancel Request
                  </button>
                )}

                {canEditAction && (
                  <Link
                    href={editOrderUrl}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1565c0] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Edit
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2.5 text-xs py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Production Date</span>
          <div className="font-semibold text-gray-800 w-50">
            {displayFormat(item.productionDateFormatted, "DATE")}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">No. of Batches</span>
          <div className="font-semibold text-gray-800 w-50">
            {displayFormat(item.batchCount)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">BOM</span>
          <div className="font-semibold text-gray-800 w-50">
            {canViewBom && item.bomId ? (
              <ModuleLink
                href={buildRoute("bom", "detail", { id: item.bomId })}
                onClick={setSelectedBomForDetails ? () => setSelectedBomForDetails({ bomId: item.bomId, id: item.bomId }) : null}
                className="font-semibold text-[#1565c0] hover:underline cursor-pointer "
              >
                {displayFormat(item.bomName)}
              </ModuleLink>
            ) : (
              <span className="font-semibold text-gray-800 ">
                {displayFormat(item.bomName)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between text-xs border-t border-gray-100 ">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">
            Production Qty
          </span>
          <span className="font-bold text-gray-900">
            {displayFormat(item.productionQuantityDisplay)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">
            Package Qty
          </span>
          <span className="font-bold text-gray-900">
            {displayFormat(item.packageQuantityDisplay)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2 bg-gray-100 w-full rounded-lg px-3 py-4">
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
                {displayFormat(item.addedByName)}
              </ModuleLink>
            ) : (
              <span className="font-medium text-gray-800">
                {displayFormat(item.addedByName)}
              </span>
            )}
            <p className="text-[10px] text-gray-400">
              {displayFormat(item.addedDateFormatted, "DATE")}
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Production Order"
        message={`Are you sure you want to cancel order ${item.productionOrderCode}?`}
        confirmLabel="Cancel Order"
        onConfirm={handleCancelOrder}
        onCancel={() => setIsCancelModalOpen(false)}
        danger={true}
      />
    </div>
  );
}

