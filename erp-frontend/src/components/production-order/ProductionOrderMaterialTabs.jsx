"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { formatNumber, formatCurrency } from "@/utils/number-formatter";

export default function ProductionOrderMaterialTabs({
  materialDetails = { rawMaterials: [], semiFinished: [], finishedProducts: [] },
  packageQuantity = 1,
  currencySymbol = "",
  showToggle = true,
  isPackageToggleOn = false,
  onPackageToggleChange = null,
  onOpenDrawer = null,
}) {
  const [activeTab, setActiveTab] = useState("rawMaterials");
  const [internalPackageToggle, setInternalPackageToggle] = useState(isPackageToggleOn);

  useEffect(() => {
    setInternalPackageToggle(isPackageToggleOn);
  }, [isPackageToggleOn]);

  const handleToggleClick = () => {
    const nextValue = !internalPackageToggle;
    setInternalPackageToggle(nextValue);
    if (onPackageToggleChange) {
      onPackageToggleChange(nextValue);
    }
  };

  const rawMaterials = materialDetails?.rawMaterials || [];
  const semiFinished = materialDetails?.semiFinished || [];
  const finishedProducts = materialDetails?.finishedProducts || [];

  const getActiveItems = () => {
    if (activeTab === "rawMaterials") return rawMaterials;
    if (activeTab === "semiFinished") return semiFinished;
    if (activeTab === "finishedProducts") return finishedProducts;
    return [];
  };

  const activeItems = getActiveItems();
  console.log("Active Items:", activeItems);
  const isFinishedTab = activeTab === "finishedProducts";
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
        <h3 className="text-base font-semibold text-gray-900">Material Details</h3>

        <div className="flex items-center gap-6">
          {/* {showToggle && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-600">Package Quantity</span>
              <button
                type="button"
                onClick={handleToggleClick}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  internalPackageToggle ? "bg-[#1565c0]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    internalPackageToggle ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )} */}

          <div className="flex items-center gap-1 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("rawMaterials")}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === "rawMaterials"
                  ? "border-[#1565c0] text-[#1565c0] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Raw Material(s)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("semiFinished")}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === "semiFinished"
                  ? "border-[#1565c0] text-[#1565c0] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semi Finished Products
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("finishedProducts")}
              className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === "finishedProducts"
                  ? "border-[#1565c0] text-[#1565c0] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Finished Products
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="bg-gray-200 text-gray-600 font-semibold border-b border-gray-100">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Sr. No.</th>
              <th className="py-3 px-4 w-24 text-center">Item Image</th>
              <th className="py-3 px-4 min-w-[220px]">Item Name*</th>
              <th className="py-3 px-4 text-center">Qty Per Unit*</th>
              <th className="py-3 px-4 text-right">Cost Per Unit*</th>
              <th className="py-3 px-4 text-center">
                {isFinishedTab ? "Produced Qty" : "Total Required Qty"}
              </th>
              <th className="py-3 px-4 text-centre">Total Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  No items in this category.
                </td>
              </tr>
            ) : (
              activeItems.map((item, idx) => {
                const pkgQtyVal = Number(packageQuantity) || 1;
                const dualQtyText = internalPackageToggle
                  ? item.packageQuantityDisplay 
                  : null;

                return (
                  <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-center font-medium text-gray-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <SharedImageZoom
                        id={`po-material-item-${item.itemId || item.id || idx}`}
                        src={item.itemImageUrl}
                        alt={item.itemName}
                        placeholderText={<Package size={18} />}
                        thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0 mx-auto cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-4">
                      {item.itemId ? (
                        <ModuleLink
                          href={buildRoute("item", "detail", { id: item.itemId })}
                          onClick={onOpenDrawer ? () => onOpenDrawer("Item", item.itemId) : null}
                          className="font-medium text-[#1565c0] hover:underline text-left cursor-pointer"
                        >
                          {item.itemName}
                        </ModuleLink>
                      ) : (
                        <span className="font-medium text-gray-900">{item.itemName}</span>
                      )}
                      <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                        ({item.itemCode || "N/A"})
                      </p>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      {isFinishedTab ? "NA" : formatNumber(item.qtyPerUnit ?? item.qtyPerUnitDisplay)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono">
                      {item.unitPrice !== undefined && item.unitPrice !== null && Number(item.unitPrice) > 0
                        ? formatCurrency(item.unitPrice, currencySymbol)
                        : item.unitPriceFormatted || "NA"}
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(item.totalRequiredQty ?? item.totalRequiredQtyDisplay)}
                        </span>
                        {dualQtyText && (
                          <p className="text-[11px] text-[#1565c0] font-semibold mt-0.5">{dualQtyText}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-start font-mono font-semibold text-gray-900">
                      {item.totalCost !== undefined && item.totalCost !== null && Number(item.totalCost) > 0
                        ? formatCurrency(item.totalCost, currencySymbol)
                        : item.totalCostFormatted || "NA"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-2 bg-gray-50/50 border-t border-gray-100 text-right">
        <span className="text-[11px] text-gray-400 italic">*NA: Not Applicable</span>
      </div>
    </div>
  );
}
