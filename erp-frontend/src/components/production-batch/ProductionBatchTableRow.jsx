"use client";

import { useAuth } from "@/context/AuthContext";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import productionBatchConfig from "@/config/production-batch.config.json";

export default function ProductionBatchTableRow({
  item,
  onRowAction,
  setSelectedBatchForDetails,
  setSelectedItemForDetails,
  setSelectedOrderForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
}) {
  const { user } = useAuth();

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors text-sm">
      {productionBatchConfig.columns.map((col, idx) => {
        if (col.showForSuperAdminOnly && !user?.isSuperAdmin) {
          return null;
        }

        const value = item[col.key];

        if (col.key === "batchCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <ModuleLink
                moduleName="ProductionBatch"
                id={item.id || item.productionBatchId || item.batchId}
                className="font-bold text-[#1565c0] hover:underline"
                onOpenDrawer={setSelectedBatchForDetails ? () => setSelectedBatchForDetails(item) : null}
              >
                {value || "—"}
              </ModuleLink>
            </td>
          );
        }

        if (col.key === "productionOrderCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <ModuleLink
                moduleName="ProductionOrder"
                id={item.productionOrderId}
                className="font-medium text-[#1565c0] hover:underline"
                onOpenDrawer={setSelectedOrderForDetails ? () => setSelectedOrderForDetails({ productionOrderId: item.productionOrderId }) : null}
              >
                {value || "—"}
              </ModuleLink>
            </td>
          );
        }

        if (col.key === "itemName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <ModuleLink
                moduleName="Item"
                id={item.itemId}
                className="font-medium text-[#1565c0] hover:underline"
                onOpenDrawer={setSelectedItemForDetails ? () => setSelectedItemForDetails({ itemId: item.itemId }) : null}
              >
                {value || "—"}
              </ModuleLink>
            </td>
          );
        }

        if (col.key === "bomCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <ModuleLink
                moduleName="Bom"
                id={item.bomId}
                className="font-medium text-[#1565c0] hover:underline font-mono"
                onOpenDrawer={setSelectedBomForDetails ? () => setSelectedBomForDetails({ bomId: item.bomId }) : null}
              >
                {value || "—"}
              </ModuleLink>
            </td>
          );
        }

        if (col.key === "addedByName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <ModuleLink
                moduleName="User"
                id={item.addedBy}
                className="font-medium text-[#1565c0] hover:underline"
                onOpenDrawer={setSelectedUserForDetails ? () => setSelectedUserForDetails({ addedBy: item.addedBy }) : null}
              >
                {value || "—"}
              </ModuleLink>
            </td>
          );
        }

        if (col.type === "statusBadge" || col.key === "status") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <StatusBadge status={value} />
            </td>
          );
        }

        return (
          <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap text-gray-700 font-mono">
            {value !== null && value !== undefined && value !== "" ? value : "—"}
          </td>
        );
      })}
    </tr>
  );
}
