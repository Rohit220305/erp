"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Layers, Barcode, Edit, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function BomGridCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedProcessTemplateForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!item) return null;

  const viewPerm = config?.permissions?.view || "BOM_VIEW";
  const editPerm = config?.permissions?.update || "BOM_UPDATE";

  const hasViewPerm = can(viewPerm);
  const canEdit = can(editPerm);
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");

  const initial = item.addedByName ? item.addedByName.charAt(0).toUpperCase() : "B";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
      {/* Top Header Section */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Circular Image Avatar */}
          <div className="relative shrink-0">
            <SharedImageZoom
              id={`bom-grid-item-${item.id}`}
              src={item.itemImageUrl}
              alt={item.itemName}
              placeholderText={<Layers size={22} className="text-gray-400" />}
              thumbnailClassName="w-14 h-14 rounded-full border-2 border-white shadow-md bg-gray-50"
              objectFit="cover"
            />
          </div>

          {/* Titles & Barcode */}
          <div className="min-w-0 flex-1">
            {hasViewPerm && setSelectedItemForDetails ? (
              <button
                type="button"
                onClick={() => setSelectedItemForDetails(item)}
                className="text-[#1565c0] hover:underline cursor-pointer font-semibold text-sm block truncate text-left w-full"
              >
                {item.bomName || "—"}
              </button>
            ) : (
              <p className="text-sm font-semibold text-gray-900 truncate">
                {item.bomName || "—"}
              </p>
            )}

            <p className="text-xs font-mono text-gray-400 mt-0.5 truncate">
              {item.bomCode || "—"}
            </p>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono mt-1">
              <Barcode size={14} className="text-gray-400 shrink-0" />
              <span className="truncate">{item.itemBarcode || "—"}</span>
            </div>
          </div>
        </div>

        {/* Key-Value Details */}
        <div className="mt-5 space-y-2 text-xs border-t border-gray-100 pt-4">
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400 font-medium">Item Name</span>
            {canViewItem && setSelectedOutputItemForDetails ? (
              <button
                type="button"
                onClick={() =>
                  setSelectedOutputItemForDetails({
                    categoryId: item.itemId,
                    id: item.itemId,
                  })
                }
                className="text-[#1565c0] hover:underline cursor-pointer font-medium truncate text-left"
              >
                {item.itemName || "—"}
              </button>
            ) : (
              <span className="text-gray-800 font-medium truncate">
                {item.itemName || "—"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400 font-medium">Cost Per Unit</span>
            <span className="text-gray-900 font-semibold truncate">
              {item.costPerUnitFormatted || item.costPerUnit || "—"}
            </span>
          </div>

          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400 font-medium">Total Material</span>
            <span className="text-gray-800 font-medium truncate">
              {item.totalMaterial ?? "0"}
            </span>
          </div>

          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400 font-medium">Production Method</span>
            <span className="text-gray-800 font-medium truncate capitalize">
              {item.productionMethod || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Section (Grey Bar) */}
      <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#1565c0] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">
              {item.addedByName || "—"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium truncate">
              {item.addedDateFormatted || "—"}
            </p>
          </div>
        </div>

        {/* 3-dots Action Menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 text-xs">
              {hasViewPerm && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (setSelectedItemForDetails) setSelectedItemForDetails(item);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Eye size={14} className="text-gray-400" />
                  <span>View Details</span>
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(`/bom/edit/${item.id}`);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  <Edit size={14} className="text-gray-400" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
