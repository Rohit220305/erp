"use client";

import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import ModuleLink from "@/components/common/ModuleLink";

export default function ProductionBatchProcessTabs({
  calculatedProcesses = [],
  allExitItemIds = new Set(),
  activeTab = "SUMMARY",
  setActiveTab,
  onOpenDrawer,
}) {
  const [displayExitItems, setDisplayExitItems] = useState([]);
  const [displayEntryItems, setDisplayEntryItems] = useState([]);

  useEffect(() => {
    let activeItems = [];
    if (activeTab === "SUMMARY") {
      activeItems = calculatedProcesses.flatMap((p) => p.items || []);
    } else {
      activeItems =
        calculatedProcesses.find((p) => p.processId === activeTab)?.items || [];
    }

    const exitItems = activeItems.filter((i) => i.materialType === "Exit");
    const entryItems = activeItems.filter((i) => i.materialType === "Entry");

    const exitAggregated = Object.values(
      exitItems.reduce((acc, item) => {
        if (!acc[item.itemId]) {
          acc[item.itemId] = { ...item };
        } else {
          acc[item.itemId].requestQty = parseFloat(
            (acc[item.itemId].requestQty + item.requestQty).toFixed(2)
          );
          acc[item.itemId].shortage = parseFloat(
            (acc[item.itemId].shortage + item.shortage).toFixed(2)
          );
          acc[item.itemId].totalRequirement = parseFloat(
            (acc[item.itemId].totalRequirement + item.totalRequirement).toFixed(2)
          );
        }
        return acc;
      }, {})
    );

    const entryAggregated = Object.values(
      entryItems.reduce((acc, item) => {
        if (!acc[item.itemId]) {
          acc[item.itemId] = { ...item };
        } else {
          acc[item.itemId].requestQty = parseFloat(
            (acc[item.itemId].requestQty + item.requestQty).toFixed(2)
          );
          acc[item.itemId].shortage = parseFloat(
            (acc[item.itemId].shortage + item.shortage).toFixed(2)
          );
          acc[item.itemId].totalRequirement = parseFloat(
            (acc[item.itemId].totalRequirement + item.totalRequirement).toFixed(2)
          );
        }
        return acc;
      }, {})
    ).sort((a, b) => {
      const aIsRaw = !allExitItemIds.has(a.itemId);
      const bIsRaw = !allExitItemIds.has(b.itemId);
      if (aIsRaw && !bIsRaw) return -1;
      if (!aIsRaw && bIsRaw) return 1;
      return 0;
    });

    setDisplayExitItems(exitAggregated);
    setDisplayEntryItems(entryAggregated);
  }, [activeTab, calculatedProcesses, allExitItemIds]);

  const activeProcessName =
    activeTab === "SUMMARY"
      ? "MATERIAL SUMMARY"
      : calculatedProcesses.find((p) => p.processId === activeTab)?.processName ||
        `PROCESS ${activeTab}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="w-full md:w-64 bg-white rounded-md border border-gray-200 shadow-sm flex flex-col justify-between self-stretch min-h-[400px] overflow-hidden">
        <div className="p-5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Process List
          </h3>
          <div className="space-y-1">
            {calculatedProcesses.map((proc) => {
              const isSelected = activeTab === proc.processId;
              return (
                <button
                  key={proc.processId}
                  type="button"
                  onClick={() => setActiveTab(proc.processId)}
                  className={`w-full flex items-center justify-between py-2.5 px-3 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 text-[#1565c0]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{proc.processName || `Process ${proc.processId}`}</span>
                  <Edit2 size={13} className="text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab("SUMMARY")}
            className={`w-full py-3 px-4 rounded text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${
              activeTab === "SUMMARY"
                ? "bg-[#1565c0] text-white shadow-sm"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            MATERIAL SUMMARY
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-100/80 border-b border-gray-200 px-6 py-3 font-semibold text-xs text-gray-700 uppercase tracking-wider">
          {activeProcessName}
        </div>

        <div className="p-6 space-y-8">
          {displayExitItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 block">
                Exit Material
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">Sr. No.</th>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3 text-right">Total Requirement</th>
                      <th className="px-4 py-3 text-right">Utilize Stock</th>
                      <th className="px-4 py-3 text-right">Shortage</th>
                      <th className="px-4 py-3 text-right">Qty To Produce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayExitItems.map((item, idx) => (
                      <tr
                        key={`exit-${item.itemId}-${idx}`}
                        className="border-b border-gray-100 hover:bg-gray-50 bg-white"
                      >
                        <td className="px-4 py-3.5 text-center text-gray-600 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          {item.itemId ? (
                            <ModuleLink
                              moduleName="Item"
                              id={item.itemId}
                              className="font-bold text-[#1565c0] hover:underline"
                              onOpenDrawer={onOpenDrawer}
                            >
                              {item.itemName}
                            </ModuleLink>
                          ) : (
                            <div className="font-bold text-gray-900">
                              {item.itemName}
                            </div>
                          )}
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                            ({item.itemCode })
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-900 font-medium">
                          {item.totalRequirement || item.requestQty} {item.uomName || "gms"}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-600">
                          0.00 {item.uomName || "gms"}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-gray-900 font-medium">
                          {item.shortage} {item.uomName || "gms"}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-gray-900">
                          {item.requestQty} {item.uomName || "gms"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {displayEntryItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-3 block">
                Entry Material
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">Sr. No.</th>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3 text-right">Total Requirement</th>
                      <th className="px-4 py-3 text-right">Available Stock</th>
                      <th className="px-4 py-3 text-right">Utilize Stock</th>
                      <th className="px-4 py-3 text-right">Shortage</th>
                      <th className="px-4 py-3 text-right">Request Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayEntryItems.map((item, idx) => {
                      const isRawMaterial = !allExitItemIds.has(item.itemId);
                      return (
                        <tr
                          key={`entry-${item.itemId}-${idx}`}
                          className={`border-b border-gray-100 ${
                            isRawMaterial ? "bg-[#dbeafe]/80" : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3.5 text-center text-gray-600 font-medium">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3.5">
                            {item.itemId ? (
                              <ModuleLink
                                moduleName="Item"
                                id={item.itemId}
                                className="font-bold text-[#1565c0] hover:underline"
                                onOpenDrawer={onOpenDrawer}
                              >
                                {item.itemName}
                              </ModuleLink>
                            ) : (
                              <div className="font-bold text-gray-900">
                                {item.itemName}
                              </div>
                            )}
                            <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                              ({item.itemCode } )
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-gray-900 font-medium">
                            {item.totalRequirement || item.requestQty} {item.uomName || "gms"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-gray-600">
                            {item.availableStock ?? "0.00"} {item.uomName || "gms"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-gray-600">
                            0.00 {item.uomName || "gms"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-gray-900 font-medium">
                            {item.shortage} {item.uomName || "gms"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-gray-900">
                            {item.requestQty} {item.uomName || "gms"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

