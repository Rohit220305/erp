"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function BomListCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedProcessTemplateForDetails,
  setSelectedCompanyForDetails,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const viewPerm = config?.permissions?.view || "BOM_VIEW";
  const hasViewPerm = can(viewPerm);
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const isActive = item.status === "Active" || item.status === "active";

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 shadow-xs hover:shadow-sm">
        {/* Summary Top Row */}
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center flex-1 min-w-0">
            {/* Column 1: Item Image & Item Name */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                Item Name
              </p>
              <div className="flex items-center gap-3">
                <SharedImageZoom
                  id={`bom-list-item-${item.id}`}
                  src={item.itemImageUrl}
                  alt={item.itemName}
                  placeholderText={<Layers size={18} className="text-gray-400" />}
                  thumbnailClassName="w-10 h-10 rounded-full border border-gray-200 shrink-0"
                  objectFit="cover"
                />
                <div className="min-w-0">
                  {canViewItem && setSelectedOutputItemForDetails ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedOutputItemForDetails({
                          categoryId: item.itemId,
                          id: item.itemId,
                        })
                      }
                      className="block text-[#1565c0] hover:underline cursor-pointer font-semibold text-xs truncate text-left"
                    >
                      {item.itemName || "—"}
                    </button>
                  ) : (
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {item.itemName || "—"}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                    ({item.itemCode || "—"})
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2: BoM Name */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                BoM Name
              </p>
              {hasViewPerm && setSelectedItemForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(item)}
                  className="block text-[#1565c0] hover:underline cursor-pointer font-semibold text-xs truncate text-left"
                >
                  {item.bomName || "—"}
                </button>
              ) : (
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {item.bomName || "—"}
                </p>
              )}
            </div>

            {/* Column 3: Status Pill Badge */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                Status
              </p>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {item.status || "Active"}
                </span>
              </div>
            </div>

            {/* Column 4: BoM Code */}
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                BoM Code
              </p>
              <div className="text-xs font-mono text-gray-800 font-medium truncate">
                {item.bomCode || "—"}
              </div>
            </div>
          </div>

          <div
            className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={18}
            />
          </div>
        </div>

        {/* Expanded Details Row */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Reference Number</span>
                <span className="font-medium text-gray-800">
                  {item.referenceNumber || "-"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Production Method</span>
                <span className="font-semibold text-gray-800">
                  {item.productionMethod || "-"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Cost Per Unit</span>
                <span className="font-semibold text-gray-900">
                  {item.costPerUnitFormatted || item.costPerUnit || "-"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Item Bar Code</span>
                <span className="font-medium text-[#1565c0] font-mono">
                  {item.itemBarcode || "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-gray-100">
              <div>
                <span className="text-gray-400 block mb-1">Added By</span>
                <span className="font-semibold text-[#1565c0]">
                  {item.addedByName || "-"}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-1">Added Date</span>
                <span className="font-medium text-gray-800">
                  {item.addedDateFormatted || "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
