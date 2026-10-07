"use client";

import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";

export default function MaterialRequestListCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedPlantForDetails,
  setSelectedUserForDetails,
  setSelectedOrderForDetails
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const canView = can(CAPABILITIES.MATERIAL_REQUEST?.VIEW || "MATERIAL_REQUEST_VIEW");
  const canViewPlant = can(CAPABILITIES.PLANT?.VIEW || "PLANT_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  const plantOrBatchDisplay = item?.plantName || item?.batchCode || "—";
  const plantId = item?.plantId;

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-4 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Material Transfer Request
              </p>
              {canView ? (
                <ModuleLink
                  href={buildRoute("material-request", "detail", {
                    id: item.id,
                  })}
                  onClick={
                    setSelectedItemForDetails
                      ? () => setSelectedItemForDetails(item)
                      : null
                  }
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-bold text-sm font-mono truncate"
                >
                  {displayFormat(item.code)}
                </ModuleLink>
              ) : (
                <p className="text-sm font-bold text-gray-800 font-mono truncate">
                  {displayFormat(item.code)}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Plant
              </p>
              {plantId && canViewPlant && setSelectedPlantForDetails ? (
                <ModuleLink
                  href={buildRoute("plant", "detail", { id: plantId })}
                  onClick={() =>
                    setSelectedPlantForDetails({ plantId, id: plantId })
                  }
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                >
                  {displayFormat(item.plantName)}
                </ModuleLink>
              ) : (
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.plantName)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Warehouse
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {displayFormat(item.warehouseName)}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <StatusBadge status={item.status} />
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
                  Requested By
                </p>
                {item.requestedBy &&
                  canViewUser &&
                  setSelectedUserForDetails ? (
                  <ModuleLink
                    href={buildRoute("user", "detail", {
                      id: item.requestedBy,
                    })}
                    onClick={() =>
                      setSelectedUserForDetails({
                        id: item.requestedBy,
                        userId: item.requestedBy,
                      })
                    }
                    className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                  >
                    {displayFormat(item.requestedByName)}
                  </ModuleLink>
                ) : (
                  <div className="text-[13px] text-gray-800 font-medium truncate">
                    {displayFormat(item.requestedByName)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Requested Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.requestedDateFormatted, "DATE")}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Delivered Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.deliveredDateFormatted, "DATE")}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Total Requested Qty
                </p>
                <div className="text-[13px] font-mono text-gray-800 font-semibold truncate">
                  {displayFormat(item.requestedQtySumFormatted)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Remarks
                </p>
                <div className="text-[13px] text-gray-600 truncate">
                  {displayFormat(item.remark)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
