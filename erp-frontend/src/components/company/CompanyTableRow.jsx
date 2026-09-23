"use client";

import { useAuth } from "@/context/AuthContext";
import { Building2 } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import companyConfig from "@/config/company.config.json";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function CompanyTableRow({ item, onRowAction, setSelectedItemForDetails }) {
  const { can } = useAuth();

  const hasViewPerm = can(companyConfig.permissions?.view);
  const isActive = item.status === "Active";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 text-sm">
        <SharedImageZoom
          id={`table-company-${item.id}`}
          src={item.logoUrl}
          alt={item.companyName}
          placeholderText={<Building2 size={18} />}
          thumbnailClassName="h-10 w-10 rounded-xl object-cover border border-gray-100"
          modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
        />
      </td>

      <td className="px-4 py-3 text-sm">
        {hasViewPerm ? (
          <ModuleLink
            href={buildRoute("company", "detail", { id: item.id })}
            onClick={() =>
              setSelectedItemForDetails && setSelectedItemForDetails(item)
            }
            className="font-semibold text-[#1565c0] hover:underline cursor-pointer"
          >
            {displayFormat(item.companyName)}
          </ModuleLink>
        ) : (
          <span className="font-semibold text-gray-800">
            {displayFormat(item.companyName)}
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {displayFormat(item.shortName)}
      </td>

      <td className="px-4 py-3 text-sm">
        <span className="font-mono text-xs text-gray-600 ">
          {displayFormat(item.companyCode)}
        </span>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {displayFormat(item.contactPersonName)}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700 truncate">
        <span title={item.email}>{displayFormat(item.email)}</span>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {displayFormat(item.fullPhoneNumber)}
      </td>

      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {displayFormat(item.addedDateFormatted, "DATE")}
      </td>
      <td className="px-4 py-3 text-sm">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}