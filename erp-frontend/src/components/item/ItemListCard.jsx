"use client";

import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";

export default function ItemListCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedCategoryForDetails,
  setSelectedCompanyForDetails,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const viewPerm = config?.permissions?.view || "ITEM_VIEW";
  const hasViewPerm = can(viewPerm);
  const canViewCategory = can(CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW");
  const isActive = item.status === "Active" || item.status === "active";

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-5 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Item
              </p>
              <div className="flex items-center gap-3">
                <SharedImageZoom
                  id={`item-list-${item.id}`}
                  src={item.primaryImageUrl}
                  alt={item.itemName}
                  placeholderText={<Package size={18} />}
                  thumbnailClassName="w-10 h-10 rounded-lg border border-gray-100 shrink-0"
                />
                <div className="min-w-0">
                  {hasViewPerm ? (
                    <ModuleLink
                      href={buildRoute("item", "detail", { id: item.id })}
                      onClick={() =>
                        setSelectedItemForDetails &&
                        setSelectedItemForDetails(item)
                      }
                      className="block font-semibold text-sm truncate text-[#1565c0]"
                    >
                      {displayFormat(item.itemName)}
                    </ModuleLink>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayFormat(item.itemName)}
                    </p>
                  )}
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5 no-underline truncate">
                    {displayFormat(item.itemCode)}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Category
              </p>
              {canViewCategory && setSelectedCategoryForDetails ? (
                <ModuleLink
                  href={item.categoryId ? buildRoute("item-category", "detail", { id: item.categoryId }) : "#"}
                  onClick={() => setSelectedCategoryForDetails(item)}
                  className="block font-medium text-[13px] truncate text-[#1565c0]"
                >
                  {displayFormat(item.categoryName)}
                </ModuleLink>
              ) : (
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.categoryName)}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Brand
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {displayFormat(item.brandName)}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Usage Type
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {displayFormat(item.usageType)}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  {displayFormat(item.status)}
                </span>
              </div>
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
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Manufacturer
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.manufacturerName)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Barcode
                </p>
                <div className="text-[13px] font-mono text-gray-800 font-medium truncate">
                  {displayFormat(item.barcode)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Item UOM
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.itemUomName)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Purchase Price
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.purchasePriceFormatted)}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Added Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.addedDateFormatted, "DATE")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
