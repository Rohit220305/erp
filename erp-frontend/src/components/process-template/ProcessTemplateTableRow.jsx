"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function ProcessTemplateTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can(CAPABILITIES.PROCESS_TEMPLATE?.VIEW || "PROCESS_TEMPLATE_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("process-template", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
          >
            {displayFormat(item.templateName)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item.templateName)}
          </span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-mono text-gray-900 ">
          {displayFormat(item.templateCode)}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <span className="inline-flex items-center ">
          {displayFormat(item.executionType)}
        </span>
      </td>

      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[180px] max-w-[220px] truncate">
          {item.companyName ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={() => setSelectedCompanyForDetails?.({ companyId: item.companyId })}
              className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
              title={item.companyName}
            >
              {displayFormat(item.companyName)}
            </ModuleLink>
          ) : (
            <span className="text-sm font-medium text-gray-900">{displayFormat(item.companyName)}</span>
          )}
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {displayFormat(item.addedDateFormatted, "DATE")}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}
