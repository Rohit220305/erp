"use client";

import { useAuth } from "@/context/AuthContext";
import bomConfig from "@/config/bom.config.json";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";

export default function BomTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedOutputItemForDetails,
  setSelectedProcessTemplateForDetails,
  setSelectedCompanyForDetails,
  setSelectedUserForDetails,
}) {
  const { can, user } = useAuth();

  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewProcessTemplate = can(CAPABILITIES.PROCESS_TEMPLATE?.VIEW || "PROCESS_TEMPLATE_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
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
                <ModuleLink
                  href={buildRoute("bom", "detail", { id: item.id })}
                  onClick={() => setSelectedItemForDetails(item)}
                  className="font-semibold text-[#1565c0] hover:underline cursor-pointer"
                >
                  {displayFormat(value)}
                </ModuleLink>
              ) : (
                <span className="font-semibold text-gray-800">{displayFormat(value)}</span>
              )}
            </td>
          );
        }

        if (col.key === "bomCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-800">
              {displayFormat(value)}
            </td>
          );
        }

        if (col.key === "itemName") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              {canViewItem && setSelectedOutputItemForDetails ? (
                <ModuleLink
                  href={buildRoute("item", "detail", { id: item.itemId })}
                  onClick={() => setSelectedOutputItemForDetails({ categoryId: item.itemId, id: item.itemId })}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer"
                >
                  {displayFormat(value)}
                </ModuleLink>
              ) : (
                <span className="text-gray-800">{displayFormat(value)}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemCode") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-700">
              {displayFormat(value)}
            </td>
          );
        }

        if (col.key === "productionMethod") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap text-gray-800 capitalize">
              {displayFormat(value)}
            </td>
          );
        }

        if (col.key === "companyName") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              {canViewCompany && setSelectedCompanyForDetails && item.companyId ? (
                <ModuleLink
                  href={buildRoute("company", "detail", { id: item.companyId })}
                  onClick={() => setSelectedCompanyForDetails({ companyId: item.companyId, id: item.companyId })}
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer"
                >
                  {displayFormat(value)}
                </ModuleLink>
              ) : (
                <span className="text-gray-800">{displayFormat(value)}</span>
              )}
            </td>
          );
        }

        if (col.key === "itemBarcode") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap font-mono text-gray-800">
              {displayFormat(value)}
            </td>
          );
        }

        if (col.key === "addedByName") {
          const userId = item.addedBy || item.addedById || item.added_by || item.createdBy;
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              {canViewUser ? (
                <ModuleLink
                  href={userId ? buildRoute("user", "detail", { id: userId }) : buildRoute("user", "list")}
                  onClick={
                    setSelectedUserForDetails && userId
                      ? () => setSelectedUserForDetails({ id: userId, userId, addedBy: userId })
                      : null
                  }
                  className="font-medium text-[#1565c0] hover:underline cursor-pointer"
                >
                  {displayFormat(value)}
                </ModuleLink>
              ) : (
                <span className="font-medium text-gray-900">{displayFormat(value)}</span>
              )}
            </td>
          );
        }

        if (col.key === "addedDateFormatted") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap text-gray-700">
              {displayFormat(value, "DATE")}
            </td>
          );
        }

        if (col.type === "statusBadge" || col.key === "status") {
          return (
            <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap">
              <StatusBadge status={value} />
            </td>
          );
        }

        return (
          <td key={col.key || idx} className="px-4 py-3.5 whitespace-nowrap text-gray-700">
            {displayFormat(value !== null && value !== undefined && value !== "" ? (col.type === "date" ? displayFormat(value, "DATE") : value) : null)}
          </td>
        );
      })}
    </tr>
  );
}
