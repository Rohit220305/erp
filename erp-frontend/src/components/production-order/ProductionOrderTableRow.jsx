"use client";

import { useAuth } from "@/context/AuthContext";
import productionOrderConfig from "@/config/production-order.config.json";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";

import { formatNumber } from "@/utils/number-formatter";

export default function ProductionOrderTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedBomForDetails,
  setSelectedUserForDetails,
}) {
  const { can, user } = useAuth();
  const canViewOrder = can(CAPABILITIES.PRODUCTION_ORDER?.VIEW || "PRODUCTION_ORDER_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

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
              {canViewOrder ? (
                <ModuleLink
                  href={buildRoute("production-order", "detail", { id: item.id })}
                  onClick={setSelectedItemForDetails ? () => setSelectedItemForDetails(item) : null}
                  className="font-bold text-[#1565c0] hover:underline cursor-pointer"
                >
                  {value || "—"}
                </ModuleLink>
              ) : (
                <span className="font-bold text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewItem && item.itemId ? (
                <ModuleLink
                  href={buildRoute("item", "detail", { id: item.itemId })}
                  onClick={setSelectedOutputItemForDetails ? () => setSelectedOutputItemForDetails({ itemId: item.itemId, id: item.itemId }) : null}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer"
                >
                  {value || "—"}
                </ModuleLink>
              ) : (
                <span className="font-medium text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "bomCode" || col.key === "bomName") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewBom && item.bomId ? (
                <ModuleLink
                  href={buildRoute("bom", "detail", { id: item.bomId })}
                  onClick={setSelectedBomForDetails ? () => setSelectedBomForDetails({ bomId: item.bomId, id: item.bomId }) : null}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer font-mono"
                >
                  {value || "—"}
                </ModuleLink>
              ) : (
                <span className="font-medium text-gray-800 font-mono">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "addedByName") {
          const userId = item.addedBy || item.addedById || item.added_by || item.createdBy;
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              {canViewUser ? (
                <ModuleLink
                  href={userId ? buildRoute("user", "detail", { id: userId }) : buildRoute("user", "list")}
                  onClick={setSelectedUserForDetails && userId ? () => setSelectedUserForDetails({ addedBy: userId, userId, id: userId }) : null}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer"
                >
                  {value || "—"}
                </ModuleLink>
              ) : (
                <span className="font-medium text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3 whitespace-nowrap">
              <span className="font-mono text-xs text-gray-700 bg-gray-50 ">
                {value || "—"}
              </span>
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
            {col.key === "productionQuantity" || col.key === "packageQuantity" || col.key === "pendingQuantity"
              ? formatNumber(value)
              : value !== null && value !== undefined && value !== ""
              ? value
              : "—"}
          </td>
        );
      })}
    </tr>
  );
}
