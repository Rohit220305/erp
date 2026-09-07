"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";

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
            {item.templateName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.templateName}
          </span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-mono text-gray-900 ">
          {item.templateCode || "—"}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <span className="inline-flex items-center ">
          {item.executionType || "Sequential"}
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
              {item.companyName}
            </ModuleLink>
          ) : (
            <span className="text-sm font-medium text-gray-900">—</span>
          )}
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        {item.addedDateFormatted || "-"}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
