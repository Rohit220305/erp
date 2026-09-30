"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import StatusBadge from "@/components/common/StatusBadge";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { formatCurrency } from "@/utils/number-formatter";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";

export default function BomListCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedProcessTemplateForDetails,
  setSelectedCompanyForDetails,
  setSelectedUserForDetails,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const viewPerm = config?.permissions?.view || "BOM_VIEW";
  const hasViewPerm = can(viewPerm);
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const isActive = item.status === "Active" || item.status === "active";

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 shadow-xs hover:shadow-sm">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center flex-1 min-w-0">
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
                    <ModuleLink
                      href={buildRoute("item", "detail", { id: item.itemId })}
                      onClick={() =>
                        setSelectedOutputItemForDetails({
                          categoryId: item.itemId,
                          id: item.itemId,
                        })
                      }
                      className="block text-[#1565c0] hover:underline cursor-pointer font-semibold text-xs truncate text-left"
                    >
                      {displayFormat(item.itemName)}
                    </ModuleLink>
                  ) : (
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {displayFormat(item.itemName)}
                    </p>
                  )}
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                    ({displayFormat(item.itemCode)})
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                BOM Name
              </p>
              {hasViewPerm && setSelectedItemForDetails ? (
                <ModuleLink
                  href={buildRoute("bom", "detail", { id: item.id })}
                  onClick={() => setSelectedItemForDetails(item)}
                  className="block text-[#1565c0] hover:underline cursor-pointer font-semibold text-xs truncate text-left"
                >
                  {displayFormat(item.bomName)}
                </ModuleLink>
              ) : (
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {displayFormat(item.bomName)}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                Status
              </p>
              <div>
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                BOM Code
              </p>
              <div className="text-xs font-mono text-gray-800 font-medium truncate">
                {displayFormat(item.bomCode)}
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

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-4 items-start pr-[52px]">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  Reference Number
                </p>
                <p className="text-xs font-medium text-gray-800 truncate">
                  {displayFormat(item.referenceNumber)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  Production Method
                </p>
                <p className="text-xs font-semibold text-gray-800 capitalize truncate">
                  {displayFormat(item.productionMethod)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  Cost Per Unit
                </p>
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {displayFormat(item.costPerUnitFormatted || (item.costPerUnit != null && item.costPerUnit !== "" ? formatCurrency(item.costPerUnit, item.currencySymbol) : null))}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  Item Bar Code
                </p>
                <p className="text-xs font-medium text-[#1565c0] font-mono truncate">
                  {displayFormat(item.itemBarcode)}
                </p>
              </div>

              <div className="min-w-0 mt-3">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  Added By
                </p>
                {(() => {
                  const userId = item.addedBy || item.addedById || item.added_by || item.createdBy;
                  return canViewUser ? (
                    <ModuleLink
                      href={userId ? buildRoute("user", "detail", { id: userId }) : buildRoute("user", "list")}
                      onClick={
                        setSelectedUserForDetails && userId
                          ? () => setSelectedUserForDetails({ id: userId, userId, addedBy: userId })
                          : null
                      }
                      className="font-semibold text-xs text-[#1565c0] hover:underline cursor-pointer truncate block"
                    >
                      {displayFormat(item.addedByName)}
                    </ModuleLink>
                  ) : (
                    <span className="font-semibold text-xs text-gray-900 truncate block">
                      {displayFormat(item.addedByName)}
                    </span>
                  );
                })()}
              </div>

              <div className="min-w-0 mt-3">
                <p className="text-[11px] text-gray-400 mb-1.5 font-medium">
                  Added Date
                </p>
                <p className="text-xs font-medium text-gray-800 truncate">
                  {displayFormat(item.addedDateFormatted, "DATE")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
