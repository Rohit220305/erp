"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import StatusBadge from "@/components/common/StatusBadge";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import { markMaterialRequestDelivered, cancelMaterialRequest } from "@/lib/api/material-request-api";
import ConfirmModal from "@/components/common/ConfirmModal";
import { toast } from "react-hot-toast";

export default function MaterialRequestGridCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedPlantForDetails, 
  setSelectedUserForDetails,
  setSelectedOrderForDetails,
}) {
  console.log("MaterialRequestGridCard item:", item);
  const { can } = useAuth();
  const router = useRouter();
  const [modalState, setModalState] = useState({ isOpen: false, type: "", request: null });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = () => setIsDropdownOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleAction = async () => {
    const { type, request } = modalState;
    try {
      let res;
      if (type === "DELIVER") {
        res = await markMaterialRequestDelivered({ id: request.id });
      } else if (type === "CANCEL") {
        res = await cancelMaterialRequest({ id: request.id });
      }

      const success = res?.success === 1 || res?.settings?.success === 1;
      const msg = res?.message || res?.settings?.message;

      if (success) {
        toast.success(msg || "Success");
        window.location.reload();
      } else {
        toast.error(msg || "Something went wrong");
      }
    } catch (err) {
      toast.error("An error occurred while processing action");
    } finally {
      setModalState({ isOpen: false, type: "", request: null });
    }
  };

  if (!item) return null;

  const canView = can(CAPABILITIES.MATERIAL_REQUEST?.VIEW || "MATERIAL_REQUEST_VIEW");
  const canViewPlant = can(CAPABILITIES.PLANT?.VIEW || "PLANT_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");

  const plantOrBatchDisplay = item?.plantName || item?.productionOrderCode || "—";
  const plantId = item?.plantId;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">

      {/* 1. Header Section */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          {canView ? (
            <ModuleLink
              href={buildRoute("material-request", "detail", { id: item.id })}
              onClick={setSelectedItemForDetails ? () => setSelectedItemForDetails(item) : null}
              className="   text-[15px] text-[#1565c0] hover:underline font-mono truncate block"
            >
              {displayFormat(item.code)}
            </ModuleLink>
          ) : (
            <p className="   text-[15px] text-gray-900 font-mono truncate">
              {displayFormat(item.code)}
            </p>
          )}

        </div>
        <StatusBadge status={item.status} className="shrink-0" />
      </div>

      <hr className="border-gray-100 my-4" />

      {/* 2. Requested Date & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Requested Date :</p>
          <p className="text-[13px] text-gray-900   ">
            {displayFormat(item.requestedDateFormatted || item.requestedDate, "DATETIME")}
          </p>
        </div>

        {item.status === "Pending" && (
          <div className="relative">
            <div className="flex rounded-md border border-[#1565c0] bg-white overflow-hidden shrink-0">
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalState({ isOpen: true, type: "CANCEL", request: item });
                }}
              >
                Cancel Request
              </button>
              <button
                type="button"
                className="px-2 border-l cursor-pointer border-[#1565c0] text-[#1565c0] hover:bg-blue-50 transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen((prev) => !prev);
                }}
              >
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ease-in-out ${isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                />
              </button>
            </div>

            <div
              className={`absolute top-full right-0 mt-1.5 bg-white border border-[#1565c0] rounded-md shadow-lg z-20 w-40 overflow-hidden transition-all duration-200 ease-out origin-top-right transform ${isDropdownOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-1.5 pointer-events-none"
                }`}
            >
              <button
                type="button"
                className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1565c0] transition-colors cursor-pointer whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalState({ isOpen: true, type: "DELIVER", request: item });
                  setIsDropdownOpen(false);
                }}
              >
                Mark as Delivered
              </button>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-100 my-4" />

      {/* 3. Core Details */}
      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-[130px_1fr] items-center gap-2">
          <span className="text-gray-400">Plant Name</span>
          <span className="text-gray-900 truncate">
            {displayFormat(item.plantName)}
          </span>
        </div>

        <div className="grid grid-cols-[130px_1fr] items-center gap-2">
          <span className="text-gray-400">Production Order</span>
          {item.productionOrderId && canViewOrder && setSelectedOrderForDetails ? (
            <ModuleLink
              href={buildRoute("production-order", "detail", { id: item.productionOrderId })}
              onClick={() => setSelectedOrderForDetails({ id: item.productionOrderId, orderId: item.productionOrderId })}
              className="text-[#1565c0] hover:underline truncate font-mono"
            >
              {displayFormat(item.productionOrderCode)}
            </ModuleLink>
          ) : (
            <span className="text-gray-900 truncate font-mono">
              {displayFormat(item.productionOrderCode)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[130px_1fr] items-center gap-2">
          <span className="text-gray-400">Warehouse Name</span>
          <span className="text-gray-900   truncate">
            {displayFormat(item.warehouseName)}
          </span>
        </div>
      </div>

      <hr className="border-gray-100 my-4" />

      {/* 4. Statistics */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-400 mb-1">No. of Item(s)</p>
          <p className="text-[13px]    text-gray-900">
            {item.itemsCount || item.items?.length || 0}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 mb-1">Total Qty</p>
          <p className="text-[13px]    text-gray-900 font-mono">
            {displayFormat(item.requestedQtySumFormatted)}
          </p>
        </div>
      </div>

      {/* 5. Requested By */}
      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 mt-4 border border-gray-100">
        <div className="w-10 h-10 rounded-full bg-[#1565c0] text-white flex items-center justify-center    shrink-0">
          {item.requestedByName ? item.requestedByName.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="min-w-0 flex-1">
          {item.requestedBy && canViewUser && setSelectedUserForDetails ? (
            <ModuleLink
              href={buildRoute("user", "detail", { id: item.requestedBy })}
              onClick={() => setSelectedUserForDetails({ id: item.requestedBy, userId: item.requestedBy })}
              className="text-[13px]    text-[#1565c0] hover:underline truncate block"
            >
              {displayFormat(item.requestedByName)}
            </ModuleLink>
          ) : (
            <p className="text-[13px]   text-gray-900 truncate">
              {displayFormat(item.requestedByName)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            {displayFormat(item.requestedDateFormatted || item.requestedDate, "DATETIME")}
          </p>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.type === "DELIVER" ? "Confirm Delivery" : "Cancel Request"}
        message={
          modalState.type === "DELIVER"
            ? `Are you sure you want to mark this request as Delivered?`
            : `Are you sure you want to cancel ${modalState.request?.code}?`
        }
        confirmLabel={modalState.type === "DELIVER" ? "Mark Delivered" : "Cancel"}
        variant={modalState.type === "CANCEL" ? "danger" : "primary"}
        onConfirm={handleAction}
        onCancel={() => setModalState({ isOpen: false, type: "", request: null })}
      />
    </div>
  );
}
