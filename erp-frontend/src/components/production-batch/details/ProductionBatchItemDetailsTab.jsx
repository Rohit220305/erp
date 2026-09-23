"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import NoDataMessage from "@/components/common/NoDataMessage";
import { formatNumber } from "@/utils/number-formatter";
import { displayFormat } from "@/utils/no-data-formatter";

export default function ProductionBatchItemDetailsTab({
  materialDetails = {
    rawMaterials: [],
    semiFinished: [],
    finishedProducts: [],
  },
  onOpenDrawer = null,
}) {
  const [activeTab, setActiveTab] = useState("rawMaterials");

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <h3 className="text-[14px] font-bold text-gray-900">Item Details</h3>

        <div className="flex items-center gap-2 border-b border-gray-200 text-[14px]">
          <button
            type="button"
            onClick={() => setActiveTab("rawMaterials")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 cursor-pointer ${
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
            className={`px-4 py-2 font-medium transition-colors border-b-2 cursor-pointer ${
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
            className={`px-4 py-2 font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === "finishedProducts"
                ? "border-[#1565c0] text-[#1565c0] font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Finished Products
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px] text-gray-700">
          <thead className="bg-gray-50/80 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 w-16 text-center">Sr. No.</th>
              <th className="py-3 px-4 w-24 text-center">Item Image</th>
              <th className="py-3 px-4 min-w-[220px]">Item Name</th>
              <th className="py-3 px-4 text-center">Item UOM</th>
              <th className="py-3 px-4 text-right">Required Qty</th>
              <th className="py-3 px-4 text-right">Received Qty</th>
              <th className="py-3 px-4 text-right">
                {activeTab === "finishedProducts"
                  ? "Produced Qty"
                  : "Consumed Qty"}
              </th>
              <th className="py-3 px-4 text-right">Available Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activeItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-4">
                  <NoDataMessage moduleName="Items" />
                </td>
              </tr>
            ) : (
              activeItems.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3 px-4 text-center font-medium text-gray-500">
                    {idx + 1}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <SharedImageZoom
                      id={`pb-item-detail-${item.itemId || item.id || idx}`}
                      src={item.itemImageUrl}
                      alt={item.itemName}
                      placeholderText={<Package size={18} />}
                      thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0 mx-auto cursor-pointer object-cover"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <ModuleLink
                      moduleName="Item"
                      id={item.itemId}
                      className="font-semibold text-[#1565c0] hover:underline"
                      onOpenDrawer={onOpenDrawer}
                    >
                      {item.itemName}
                    </ModuleLink>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      ({displayFormat(item.itemCode)})
                    </p>
                  </td>

                  <td className="py-3 px-4 text-center font-medium text-gray-800">
                    {item.uomName || item.itemUomName || ""}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">
                    {formatNumber(item.requiredQty)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-gray-800">
                    {formatNumber(item.receivedQty)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-gray-800">
                    {activeTab === "finishedProducts"
                      ? formatNumber(item.producedQty)
                      : formatNumber(item.consumedQty)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-gray-800">
                    {formatNumber(item.availableStock)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
