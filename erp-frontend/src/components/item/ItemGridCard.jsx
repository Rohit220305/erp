"use client";

import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Package } from "lucide-react";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";

export default function ItemGridCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedCategoryForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can } = useAuth();
  if (!item) return null;

  const viewPerm = config?.permissions?.view || "ITEM_VIEW";
  const hasViewPerm = can(viewPerm);
  const canViewCategory = can(CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW");
  const isActive = item.status === "Active" || item.status === "active";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <SharedImageZoom
              id={`item-grid-${item.id}`}
              src={item.primaryImageUrl}
              alt={item.itemName}
              placeholderText={<Package size={18} />}
              thumbnailClassName="w-14 h-14 rounded-xl border border-gray-100"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div className="min-w-0">
            {hasViewPerm ? (
              <ModuleLink
                href={buildRoute("item", "detail", { id: item.id })}
                onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
                className="font-medium leading-tight mb-0.5 block text-[#1565c0]"
              >
                {displayFormat(item.itemName)}
              </ModuleLink>
            ) : (
              <p className="font-medium leading-tight mb-0.5 truncate text-gray-900">
                {displayFormat(item.itemName)}
              </p>
            )}
            <p className="text-gray-400 text-xs font-mono mt-1 leading-tight truncate">
              {displayFormat(item.itemCode)}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-2.5 text-xs">
        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Category</span>
          {canViewCategory && setSelectedCategoryForDetails ? (
            <ModuleLink
              href={item.categoryId ? buildRoute("item-category", "detail", { id: item.categoryId }) : "#"}
              onClick={() => setSelectedCategoryForDetails(item)}
              className="text-[#1565c0] font-medium block"
            >
              {displayFormat(item.categoryName)}
            </ModuleLink>
          ) : (
            <span className="text-gray-900 font-medium truncate">{displayFormat(item.categoryName)}</span>
          )}
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Brand</span>
          <span className="text-gray-900 font-medium truncate">{displayFormat(item.brandName)}</span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Barcode</span>
          <span className="text-gray-900 font-mono truncate">{displayFormat(item.barcode)}</span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Price</span>
          <span className="text-gray-900 font-medium truncate">
            {displayFormat(item.purchasePriceFormatted)}
          </span>
        </div>

        {item.addedDateFormatted && (
          <div className="grid grid-cols-[90px_1fr] items-center gap-2">
            <span className="text-gray-400">Added Date</span>
            <span className="text-gray-500 truncate">{displayFormat(item.addedDateFormatted, "DATE")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
