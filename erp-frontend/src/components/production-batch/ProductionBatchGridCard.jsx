"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { cancelProductionBatch } from "@/lib/api/production-batch-api";
import { toast } from "react-hot-toast";

import { formatNumber } from "@/utils/number-formatter";
import { displayFormat } from "@/utils/no-data-formatter";

export default function ProductionBatchGridCard({
  item,
  setSelectedBatchForDetails,
  setSelectedItemForDetails,
  setSelectedOrderForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
  onRefresh,
}) {
  const { can } = useAuth();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdown(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  if (!item) return null;

  const userInitial = item.addedByName ? item.addedByName.charAt(0).toUpperCase() : "U";

  const handleCancelBatch = async () => {
    setIsCancelModalOpen(false);
    setIsCancelling(true);
    try {
      const res = await cancelProductionBatch({ id: item.id || item.productionBatchId || item.batchId });
      const success = res?.settings?.success === 1 || res?.success === 1;
      const msg = res?.settings?.message || res?.message;
      if (success) {
        toast.success(msg || "Batch cancelled successfully");
        window.location.reload();
      } else {
        toast.error(msg || "Failed to cancel batch");
      }
    } catch (err) {
      toast.error("An error occurred while cancelling batch");
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel =
    (item.status === "Pending" || item.status === "StockReceived") &&
    can(CAPABILITIES.PRODUCTION_BATCH?.DELETE || "PRODUCTION_BATCH_DELETE");

  const canRequestMaterial =
    item.status !== "Completed" &&
    item.status !== "Cancelled" &&
    can(CAPABILITIES.MATERIAL_REQUEST?.CREATE || "MATERIAL_REQUEST_CREATE");

  const batchId = item.id || item.productionBatchId || item.batchId;
  const materialRequestUrl = batchId
    ? buildRoute("production-batch", "materialRequestCreate", { id: batchId })
    : "#";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ModuleLink
            moduleName="ProductionBatch"
            id={batchId}
            className="font-bold text-sm text-[#1565c0] hover:underline"
            onOpenDrawer={
              setSelectedBatchForDetails
                ? () => setSelectedBatchForDetails(item)
                : null
            }
          >
            {displayFormat(item.batchCode)}
          </ModuleLink>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            status={item.status || "Pending"}
            module="production-batch"
          />
        </div>
      </div>

      {/* 2. MR Status & Action Button Row */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 relative">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 block mb-0.5">
            MR Status
          </span>
          <StatusBadge status={item.materialStatus || "Yet to Request"} />
        </div>

        {canRequestMaterial && (
          <div className="relative">
            <div className="flex rounded-md border border-[#1565c0] bg-white overflow-hidden shrink-0">
              <Link
                href={materialRequestUrl}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1.5 text-xs font-medium text-[#1565c0] hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center"
              >
                Request Material
              </Link>
              {canCancel && (
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

            {openDropdown && canCancel && (
              <div
                className="absolute top-full right-0 mt-1.5 bg-white border border-[#1565c0] rounded-md shadow-lg z-20 w-36 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1565c0] transition-colors cursor-pointer whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(false);
                    setIsCancelModalOpen(true);
                  }}
                >
                  Cancel Batch
                </button>
              </div>
            )}
          </div>
        )}

        {!canRequestMaterial && canCancel && (
          <button
            type="button"
            disabled={isCancelling}
            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsCancelModalOpen(true);
            }}
          >
            {isCancelling ? "Cancelling..." : "Cancel Batch"}
          </button>
        )}
      </div>

      {/* 3. Details Section */}
      <div className="space-y-2">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 tracking-wider block mb-0.5">
            BOM
          </span>
          <ModuleLink
            moduleName="ProductionOrder"
            id={item.productionOrderId}
            className="text-xs font-bold text-[#1565c0] hover:underline block"
            onOpenDrawer={
              setSelectedBomForDetails
                ? () => setSelectedBomForDetails({ bomId: item.bomId })
                : null
            }
          >
            {displayFormat(item.bomName)}
          </ModuleLink>
        </div>
        <div className="pt-1">
          <span className="text-[11px] font-semibold text-gray-400 tracking-wider block mb-0.5">
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
            {displayFormat(item.itemName)}
          </ModuleLink>
        </div>
      </div>

      <div className="space-y-2 text-xs pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-gray-500 font-medium">Batch Quantity</span>
          <span className="font-medium font-mono text-gray-500">
            {item.batchQuantityFormatted || 0}
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
              {displayFormat(item.addedDateFormatted, "DATE")}
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Production Batch"
        message={`Are you sure you want to cancel batch ${item.batchCode || ""}?`}
        confirmLabel="Cancel Batch"
        onConfirm={handleCancelBatch}
        onCancel={() => setIsCancelModalOpen(false)}
        danger={true}
      />
    </div>
  );
}
