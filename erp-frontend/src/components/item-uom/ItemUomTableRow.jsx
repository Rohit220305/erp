"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function ItemUomTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
  setSelectedUserForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can(CAPABILITIES.ITEM_UOM?.VIEW || "ITEM_UOM_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  const formatUnitType = (type) => {
    if (!type) return null;
    const types = {
      length: "Length",
      temperature: "Temperature",
      density: "Density",
      volume: "Volume",
      weight: "Weight",
      time: "Time",
      pumping_rate: "Pumping Rate",
    };
    return types[type] || type;
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("itemUom", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0]"
          >
            {displayFormat(item.uomName)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item.uomName)}
          </span>
        )}
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[250px] max-w-[250px] truncate">
          {canViewCompany && item.companyId ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={
                setSelectedCompanyForDetails
                  ? () => setSelectedCompanyForDetails({ companyId: item.companyId })
                  : null
              }
              className="text-sm text-[#1565c0]"
              title={item.companyName}
            >
              {displayFormat(item.companyName)}
            </ModuleLink>
          ) : (
            <span className="text-sm text-gray-700" title={item.companyName}>
              {displayFormat(item.companyName)}
            </span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-mono text-gray-900 px-2 py-1">
          {displayFormat(item.itemUomCode)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {displayFormat(item.isoCode)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {displayFormat(formatUnitType(item.unitType))}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {(() => {
          const addedByUserId = item.addedBy || item.addedById || item.added_by || item.createdBy;
          return canViewUser && (addedByUserId || item.addedByName) ? (
            <ModuleLink
              href={addedByUserId ? buildRoute("user", "detail", { id: addedByUserId }) : "#"}
              onClick={
                setSelectedUserForDetails && addedByUserId
                  ? () => setSelectedUserForDetails({ userId: addedByUserId, id: addedByUserId, addedBy: addedByUserId })
                  : null
              }
              className="text-sm text-[#1565c0]"
            >
              {displayFormat(item.addedByName)}
            </ModuleLink>
          ) : (
            <span className="text-sm text-gray-700">
              {displayFormat(item.addedByName)}
            </span>
          );
        })()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500">
          {displayFormat(item.addedDateFormatted, "DATE")}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}
