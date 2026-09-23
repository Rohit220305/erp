"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function PackageTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
  setSelectedUserForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can(CAPABILITIES.PACKAGE?.VIEW || "PACKAGE_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("packageMaster", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0]"
          >
            {displayFormat(item.packageName)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item.packageName)}
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
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {displayFormat(item.packageCode)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {displayFormat(item.abbreviation)}
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
