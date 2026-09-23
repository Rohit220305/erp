"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { Warehouse } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function StorageTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canViewStorage = can(CAPABILITIES.STORAGE?.VIEW || "STORAGE_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          {item.imageUrl ? (
            <SharedImageZoom
              id={`row-${item.id}`}
              src={item.imageUrl}
              alt={item.storageName}
              thumbnailClassName="w-12 h-12 rounded-full object-cover border border-gray-200"
              modalImageClassName="w-64 h-64 rounded-full"
            />
          ) : (
            <Warehouse className="text-gray-400 w-5 h-5" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canViewStorage ? (
          <ModuleLink
            href={buildRoute("storage", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-[#1565c0] font-medium text-sm"
          >
            {displayFormat(item.storageName)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(item.storageName)}
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
              {displayFormat(item.companyName)}
            </ModuleLink>
          ) : (
            <span
              className="text-sm font-medium text-gray-900"
              title={item.companyName}
            >
              {displayFormat(item.companyName)}
            </span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {displayFormat(item.storageCode)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {displayFormat(item.addedDateFormatted, "DATE")}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
}
