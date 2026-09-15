import React from "react";
import dayjs from "dayjs";
import ModuleLink from "@/components/common/ModuleLink";
import { formatQuantityWithUom } from "@/utils/number-formatter";

export default function ProductionBatchConsumptionLogTab({ processLogs, onOpenDrawer }) {
  if (!processLogs || processLogs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <p className="text-sm text-gray-500 font-medium">
          No logs found for this batch.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-[#f8f9fa] border-b border-gray-200 text-xs font-semibold text-gray-600 tracking-wider">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Sr. No.</th>
              <th className="px-4 py-3 whitespace-nowrap">Process Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Item Name</th>
              <th className="px-4 py-3 whitespace-nowrap">Consumption Qty</th>
              <th className="px-4 py-3 whitespace-nowrap">Production Qty</th>
              <th className="px-4 py-3 whitespace-nowrap">Consumed Date</th>
              <th className="px-4 py-3 whitespace-nowrap">Added By</th>
              <th className="px-4 py-3 whitespace-nowrap">Added Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processLogs.map((log, index) => {
              const isConsumption = log.logType === "Consumption";
              const isProduction = log.logType === "Production";
              const uomStr = log.uomName || "";

              return (
                <tr
                  key={`${log.id}-${log.itemId}-${index}`}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    <ModuleLink
                      moduleName="Process"
                      id={log.processId}
                      onOpenDrawer={onOpenDrawer}
                      className="text-[#1565c0] font-medium block"
                    >
                      {log.processName}
                    </ModuleLink>
                    {log.processCode && (
                      <span className="block text-xs font-normal text-gray-500 mt-0.5">
                        ({log.processCode})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    <ModuleLink
                      moduleName="Item"
                      id={log.itemId}
                      onOpenDrawer={onOpenDrawer}
                      className="text-[#1565c0] font-medium block"
                    >
                      {log.itemName}
                    </ModuleLink>
                    {log.itemCode && (
                      <span className="block text-xs font-normal text-gray-500 mt-0.5">
                        ({log.itemCode})
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium whitespace-nowrap ${isConsumption ? "text-red-500" : "text-gray-500"}`}
                  >
                    {isConsumption
                      ? formatQuantityWithUom(log.loggedQty, uomStr)
                      : formatQuantityWithUom(0, uomStr)}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium whitespace-nowrap ${isProduction ? "text-green-600" : "text-gray-500"}`}
                  >
                    {isProduction
                      ? formatQuantityWithUom(log.loggedQty, uomStr)
                      : formatQuantityWithUom(0, uomStr)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {log.logDateFormatted ? log.logDateFormatted : "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {log.addedBy ? (
                      <ModuleLink
                        moduleName="User"
                        id={log.addedBy}
                        onOpenDrawer={onOpenDrawer}
                        className="text-[#1565c0] font-medium"
                      >
                        {log.addedByName || "User"}
                      </ModuleLink>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {log.addedDateFormatted ? log.addedDateFormatted : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
