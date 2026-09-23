"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function ItemCategoryTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
  setSelectedItemCategoryForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canViewCategory = can(CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canViewCategory ? (
          <ModuleLink
            href={buildRoute("item-category", "detail", { id: item.id })}
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
        <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
          {canViewCompany && item.companyId ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={setSelectedCompanyForDetails ? () => setSelectedCompanyForDetails({ companyId: item.companyId }) : null}
              className="text-[#1565c0] font-medium text-sm"
            >
              {displayFormat(item.companyName)}
            </ModuleLink>
          ) : (
            <span className="text-sm font-medium text-gray-900" title={item.companyName}>
              {displayFormat(item.companyName)}
            </span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {displayFormat(item.categoryCode)}
          </span>
        </div>
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
