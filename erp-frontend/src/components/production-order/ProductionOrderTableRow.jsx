"use client";

import { useAuth } from "@/context/AuthContext";
import productionOrderConfig from "@/config/production-order.config.json";
import { CAPABILITIES } from "@/config/capabilities.config";

export default function ProductionOrderTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCategoryForDetails,
  setSelectedCompanyForDetails,
  setSelectedUserForDetails,
}) {
  const { can, user } = useAuth();
  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "In Progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Draft":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "PartialCancelled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "Completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors text-sm">
      {productionOrderConfig.columns.map((col, idx) => {
        if (col.showForSuperAdminOnly && !user?.isSuperAdmin) {
          return null;
        }

        const value = item[col.key];

        if (col.key === "productionOrderCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewOrder && setSelectedItemForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(item)}
                  className="font-bold text-[#1565c0] hover:underline cursor-pointer text-left"
                >
                  {value || "—"}
                </button>
              ) : (
                <span className="font-bold text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewItem && setSelectedCategoryForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryForDetails({ itemId: item.itemId })}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer text-left"
                >
                  {value || "—"}
                </button>
              ) : (
                <span className="font-medium text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "bomCode" || col.key === "bomName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewBom && setSelectedCompanyForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedCompanyForDetails({ bomId: item.bomId })}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer text-left font-mono"
                >
                  {value || "—"}
                </button>
              ) : (
                <span className="font-medium text-gray-800 font-mono">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "addedByName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewUser && setSelectedUserForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedUserForDetails({ addedBy: item.addedBy })}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer text-left"
                >
                  {value || "—"}
                </button>
              ) : (
                <span className="font-medium text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <span className="font-mono text-xs text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                {value || "—"}
              </span>
            </td>
          );
        }

        if (col.type === "statusBadge" || col.key === "status") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  value,
                )}`}
              >
                {value || "—"}
              </span>
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
