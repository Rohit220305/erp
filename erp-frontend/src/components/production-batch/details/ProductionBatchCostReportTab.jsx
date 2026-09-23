import React from "react";
import ModuleLink from "@/components/common/ModuleLink";
import NoDataMessage from "@/components/common/NoDataMessage";
import { displayFormat } from "@/utils/no-data-formatter";
import { Wallet2 } from "lucide-react";

export default function ProductionBatchCostReportTab({
  batchCost,
  onOpenDrawer,
}) {
  if (
    !batchCost ||
    !batchCost.materialCost ||
    batchCost.materialCost.length === 0
  ) {
    return (
      <div className="pb-10">
        <NoDataMessage moduleName="Cost Report" />
      </div>
    );
  }

  const {
    materialCost = [],
    totalMaterialCost = 0,
    totalMaterialCostFormatted,
  } = batchCost;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm ">
        <div className="flex  flex-column p-3 gap-2">
          <Wallet2 size={18} />
          <h2 className="text-[15px] font-bold text-gray-900  ">
            Material Cost
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#f8f9fa] border-b border-gray-200 text-xs font-semibold text-gray-600 tracking-wider">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Sr. No.</th>
                <th className="px-4 py-3 whitespace-nowrap">Item Name</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">
                  Usage
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right">
                  {batchCost.currency && (
                    <span className="mr-1">{`(${batchCost.currency})`}</span>
                  )}
                  Cost Per Unit
                </th>
                <th className="px-4 py-3 whitespace-nowrap text-right">
                  {batchCost.currency && (
                    <span className="mr-1">{`(${batchCost.currency})`}</span>
                  )}
                  Material Cost
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materialCost.map((item, index) => (
                <tr
                  key={`cost-${item.itemId}-${index}`}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    <ModuleLink
                      moduleName="Item"
                      id={item.itemId}
                      onOpenDrawer={onOpenDrawer}
                      className="text-[#1565c0] font-medium block"
                    >
                      {item.itemName}
                    </ModuleLink>
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-right">
                    {item.usageFormatted || displayFormat(item.usage)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap text-right">
                    {displayFormat(item.costPerUnitFormatted)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap text-right">
                    {displayFormat(item.materialCostFormatted)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-full max-w-sm ml-auto">
        <h3 className="text-[15px] font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">
          Summary
        </h3>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">
              Total Material Cost
            </span>
            <span className="text-gray-900 font-bold text-[15px]">
              {displayFormat(totalMaterialCostFormatted)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
