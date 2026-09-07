"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";

export default function WorkCentreCategoryTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
  setSelectedUserForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";

  const canViewCategory = can(CAPABILITIES.WORK_CENTRE_CATEGORY?.VIEW || "WORK_CENTRE_CATEGORY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canViewCategory ? (
          <ModuleLink
            href={buildRoute("work-centre-category", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-[#1565c0] font-medium text-sm"
          >
            {item.categoryName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.categoryName}
          </span>
        )}
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[250px] max-w-[250px] truncate">
          {canViewCompany && item.companyId ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={setSelectedCompanyForDetails ? () => setSelectedCompanyForDetails({ companyId: item.companyId }) : null}
              className="text-[#1565c0] font-medium text-sm"
            >
              {item.companyName || "—"}
            </ModuleLink>
          ) : (
            <span className="text-sm font-medium text-gray-900" title={item.companyName}>
              {item.companyName || "—"}
            </span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {item.categoryCode || "—"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canViewUser && item.addedBy ? (
          <ModuleLink
            href={buildRoute("user", "detail", { id: item.addedBy })}
            onClick={setSelectedUserForDetails ? () => setSelectedUserForDetails({ userId: item.addedBy }) : null}
            className="text-[#1565c0] font-medium text-sm"
          >
            {item.addedByName || "System"}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.addedByName || "System"}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500">
          {item.addedDateFormatted || "—"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
