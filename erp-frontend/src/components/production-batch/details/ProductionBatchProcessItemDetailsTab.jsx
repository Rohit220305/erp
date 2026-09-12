"use client";

import { Package } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";

export default function ProductionBatchProcessItemDetailsTab({
  batchData,
  handleOpenProcessDrawer,
  onOpenDrawer,
}) {
  const entryMaterials = [];
  const exitMaterials = [];

  (batchData?.processes || []).forEach((process) => {
    (process.items || []).forEach((item) => {
      const row = {
        ...item,
        processId: process.processId,
        processName: process.processName,
        processCode: process.processCode || process.processName?.toUpperCase(),
      };
      if (item.materialType === "Entry") {
        entryMaterials.push(row);
      } else if (item.materialType === "Exit") {
        exitMaterials.push(row);
      }
    });
  });

  const formatQty = (num, uom = "gms") => {
    const val = Number(num || 0);
    return `${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${uom}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-[15px] font-bold text-gray-900 mb-6 border-b border-gray-100 pb-3">
          Process Item Details
        </h2>

        <div className="space-y-3 mb-8">
          <h3 className="text-[14px] font-bold text-gray-800">
            Entry Material
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-[13px] text-gray-700">
              <thead className="bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Sr. No.</th>
                  <th className="py-3 px-4 min-w-[150px]">Process</th>
                  <th className="py-3 px-4 w-24 text-center">Item Image</th>
                  <th className="py-3 px-4 min-w-[220px]">Item Name</th>
                  {/* <th className="py-3 px-4 text-right">BOM Qty</th> */}
                  <th className="py-3 px-4 text-right">Utilize Qty</th>
                  <th className="py-3 px-4 text-right">Required Qty</th>
                  <th className="py-3 px-4 text-right">Consumption Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entryMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No entry materials found.
                    </td>
                  </tr>
                ) : (
                  entryMaterials.map((item, idx) => (
                    <tr
                      key={`entry-${item.id || idx}`}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-gray-500">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <ModuleLink
                          moduleName="Process"
                          id={item.processId}
                          className="font-semibold text-[#1565c0] hover:underline"
                          onOpenDrawer={onOpenDrawer}
                        >
                          {item.processName}
                        </ModuleLink>
                        <span className="text-[11px] block font-mono text-gray-500 font-normal">
                          ({item.processCode})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <SharedImageZoom
                          id={`pb-process-entry-${item.id || idx}`}
                          src={item.itemImageUrl}
                          alt={item.itemName}
                          placeholderText={<Package size={18} />}
                          thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0 mx-auto cursor-pointer object-cover"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <ModuleLink
                          moduleName="Item"
                          id={item.itemId}
                          className="font-semibold text-[#1565c0] hover:underline"
                          onOpenDrawer={onOpenDrawer}
                        >
                          {item.itemName}
                        </ModuleLink>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ({item.itemCode || "N/A"})
                        </p>
                      </td>

                      {/* <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        {formatQty(item.requiredQty, item.uomName)}
                      </td> */}

                      <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                        {formatQty(0, item.uomName)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        {formatQty(item.requiredQty, item.uomName)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                        {formatQty(item.consumedQty, item.uomName)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[14px] font-bold text-gray-800">Exit Material</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-[13px] text-gray-700">
              <thead className="bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Sr. No.</th>
                  <th className="py-3 px-4 min-w-[150px]">Process</th>
                  <th className="py-3 px-4 w-24 text-center">Item Image</th>
                  <th className="py-3 px-4 min-w-[220px]">Item Name</th>
                  {/* <th className="py-3 px-4 text-right">BOM Qty</th> */}
                  <th className="py-3 px-4 text-right">Utilize Qty</th>
                  <th className="py-3 px-4 text-right">Qty To Produce</th>
                  <th className="py-3 px-4 text-right">Produced Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exitMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      No exit materials found.
                    </td>
                  </tr>
                ) : (
                  exitMaterials.map((item, idx) => (
                    <tr
                      key={`exit-${item.id || idx}`}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-gray-500">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <ModuleLink
                          moduleName="Process"
                          id={item.processId}
                          className="font-semibold text-[#1565c0] hover:underline"
                          onOpenDrawer={onOpenDrawer}
                        >
                          {item.processName}
                        </ModuleLink>
                        <span className="text-[11px] block font-mono text-gray-500 font-normal">
                          ({item.processCode})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <SharedImageZoom
                          id={`pb-process-exit-${item.id || idx}`}
                          src={item.itemImageUrl}
                          alt={item.itemName}
                          placeholderText={<Package size={18} />}
                          thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0 mx-auto cursor-pointer object-cover"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <ModuleLink
                          moduleName="Item"
                          id={item.itemId}
                          className="font-semibold text-[#1565c0] hover:underline"
                          onOpenDrawer={onOpenDrawer}
                        >
                          {item.itemName}
                        </ModuleLink>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          ({item.itemCode || "N/A"})
                        </p>
                      </td>

                      {/* <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        {formatQty(item.requiredQty, item.uomName)}
                      </td> */}

                      <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                        {formatQty(0, item.uomName)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        {formatQty(
                          item.requestedQty || item.requestQty || item.requiredQty,
                          item.uomName,
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                        {formatQty(item.producedQty, item.uomName)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
