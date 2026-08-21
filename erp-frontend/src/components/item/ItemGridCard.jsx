"use client";

import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Package } from "lucide-react";
import { CAPABILITIES } from "@/config/capabilities.config";

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
        <div
          className={`flex items-center gap-3 ${hasViewPerm ? "cursor-pointer" : ""}`}
          onClick={() =>
            hasViewPerm &&
            setSelectedItemForDetails &&
            setSelectedItemForDetails(item)
          }
        >
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
            <p
              className={`font-medium leading-tight mb-0.5 truncate ${
                hasViewPerm
                  ? "text-[#1565c0] hover:underline decoration-1 underline-offset-2"
                  : "text-gray-900"
              }`}
            >
              {item.itemName || "—"}
            </p>
            <p className="text-gray-400 text-xs font-mono mt-1 leading-tight truncate">
              {item.itemCode || "—"}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-2.5 text-xs">
        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Category</span>
          {canViewCategory && setSelectedCategoryForDetails ? (
            <span
              onClick={() => setSelectedCategoryForDetails(item)}
              className="text-[#1565c0] hover:underline cursor-pointer font-medium truncate"
            >
              {item.categoryName || "—"}
            </span>
          ) : (
            <span className="text-gray-900 font-medium truncate">{item.categoryName || "—"}</span>
          )}
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Brand</span>
          <span className="text-gray-900 font-medium truncate">{item.brandName || "—"}</span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Barcode</span>
          <span className="text-gray-900 font-mono truncate">{item.barcode || "—"}</span>
        </div>

        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
          <span className="text-gray-400">Price</span>
          <span className="text-gray-900 font-medium truncate">
            {item.purchasePrice !== null && item.purchasePrice !== undefined && item.purchasePrice !== ""
              ? item.purchasePrice
              : "—"}
          </span>
        </div>

        {item.addedDateFormatted && (
          <div className="grid grid-cols-[90px_1fr] items-center gap-2">
            <span className="text-gray-400">Added Date</span>
            <span className="text-gray-500 truncate">{item.addedDateFormatted}</span>
          </div>
        )}
      </div>
    </div>
  );
}
