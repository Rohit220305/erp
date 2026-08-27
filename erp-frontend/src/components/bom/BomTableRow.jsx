"use client";

import { useAuth } from "@/context/AuthContext";
import bomConfig from "@/config/bom.config.json";
import { CAPABILITIES } from "@/config/capabilities.config";

export default function BomTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedProcessTemplateForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";

  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewProcessTemplate = can(CAPABILITIES.PROCESS_TEMPLATE?.VIEW || "PROCESS_TEMPLATE_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors text-xs font-medium">
      {bomConfig.columns.map((col, idx) => {
        if (col.showForSuperAdminOnly && !user?.isSuperAdmin) {
          return null;
        }

        const value = item[col.key];

        if (col.key === "bomName") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              {canViewBom && setSelectedItemForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(item)}
                  className="font-semibold text-[#1565c0] hover:underline cursor-pointer text-left"
                >
                  {value || "—"}
                </button>
              ) : (
                <span className="font-semibold text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "bomCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-800">
              {value || "—"}
            </td>
          );
        }

        if (col.key === "itemName") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              {canViewItem && setSelectedOutputItemForDetails ? (
                <button
                  type="button"
                  onClick={() => setSelectedOutputItemForDetails({ categoryId: item.itemId, id: item.itemId })}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer text-left"
                >
                  {value || "—"}
                </button>
              ) : (
                <span className="text-gray-800">{value || "—"}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-700">
              {value || "—"}
            </td>
          );
        }

        if (col.key === "productionMethod") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap text-gray-800 capitalize">
              {value || "—"}
            </td>
          );
        }

        if (col.key === "itemBarcode") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-800">
              {value || "—"}
            </td>
          );
        }

        if (col.key === "addedByName") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              <span className="font-semibold text-[#1565c0] hover:underline cursor-pointer">
                {value || "—"}
              </span>
            </td>
          );
        }

        if (col.key === "addedDateFormatted") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap text-gray-700">
              {value || "—"}
            </td>
          );
        }

        if (col.type === "statusBadge" || col.key === "status") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              <span
                className={`font-semibold text-xs ${
                  isActive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {value || "Active"}
              </span>
            </td>
          );
        }

        return (
          <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap text-gray-700">
            {value !== null && value !== undefined && value !== "" ? value : "—"}
          </td>
        );
      })}
    </tr>
  );
}
