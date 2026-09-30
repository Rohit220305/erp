"use client";

import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { Building2 } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function CustomerCompanyTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can, user } = useAuth();
  const canView = can(CAPABILITIES.CUSTOMER_COMPANY?.VIEW || "CUSTOMER_COMPANY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          {item?.logoUrl ? (
            <SharedImageZoom
              id={`row-${item.id}`}
              src={item.logoUrl}
              alt={item.name}
              thumbnailClassName="w-12 h-12 rounded-full object-cover border border-gray-200"
              modalImageClassName="w-64 h-64 rounded-full"
            />
          ) : (
            <Building2 className="text-gray-400 w-5 h-5" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("customer-company", "detail", { id: item?.id })}
            onClick={() => setSelectedItemForDetails?.(item)}
            className="text-[#1565c0] font-medium text-sm"
          >
            {displayFormat(item?.name)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item?.name)}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900">
            {displayFormat(item?.code)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">
          {displayFormat(item?.email)}
        </span>
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
          {canViewCompany && item?.companyId ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={() => setSelectedCompanyForDetails?.({ companyId: item.companyId })}
              className="text-[#1565c0] font-medium text-sm"
              title={item?.companyName}
            >
              {displayFormat(item?.companyName)}
            </ModuleLink>
          ) : (
            <span
              className="text-sm font-medium text-gray-900"
              title={item?.companyName}
            >
              {displayFormat(item?.companyName)}
            </span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {displayFormat(item?.addedDateFormatted, "DATE")}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={item?.status} />
      </td>
    </tr>
  );
}
