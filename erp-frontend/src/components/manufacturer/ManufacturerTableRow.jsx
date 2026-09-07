"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import ModuleLink from "@/components/common/ModuleLink";

export default function ManufacturerTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can(CAPABILITIES.MANUFACTURER?.VIEW || "MANUFACTURER_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("manufacturer", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0]"
          >
            {item.manufacturerName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.manufacturerName}
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
            {item.manufacturerCode || "—"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {item.referenceCode || "—"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {item.addedDateFormatted || "-"}
          </span>
        </div>
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
