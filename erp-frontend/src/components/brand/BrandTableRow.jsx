"use client";

import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { Tag } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function BrandTableRow({
  brand,
  onRowAction,
  setSelectedBrandForDetails,
  setSelectedCompanyForDetails,
  setSelectedManufacturerForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = brand?.status === "Active" || brand?.status === "active";
  const canView = can(CAPABILITIES.BRAND?.VIEW || "BRAND_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewManufacturer = can(CAPABILITIES.MANUFACTURER?.VIEW || "MANUFACTURER_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          {brand?.imageUrl ? (
            <SharedImageZoom
              id={`row-${brand.id}`}
              src={brand.imageUrl}
              alt={brand.brandName}
              thumbnailClassName="w-12 h-12 rounded-full object-cover border border-gray-200"
              modalImageClassName="w-64 h-64 rounded-full"
            />
          ) : (
            <Tag className="text-gray-400 w-5 h-5" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("brand", "detail", { id: brand?.id })}
            onClick={() => setSelectedBrandForDetails?.(brand)}
            className="text-[#1565c0] font-medium text-sm"
          >
            {displayFormat(brand?.brandName)}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {displayFormat(brand?.brandName)}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {displayFormat(brand?.brandCode)}
          </span>
        </div>
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
          {canViewCompany && brand?.companyId ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: brand.companyId })}
              onClick={() => setSelectedCompanyForDetails?.({ companyId: brand.companyId })}
              className="text-[#1565c0] font-medium text-sm"
              title={brand?.companyName}
            >
              {displayFormat(brand?.companyName)}
            </ModuleLink>
          ) : (
            <span
              className="text-sm font-medium text-gray-900"
              title={brand?.companyName}
            >
              {displayFormat(brand?.companyName)}
            </span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
        {canViewManufacturer && brand?.manufacturerId ? (
          <ModuleLink
            href={buildRoute("manufacturer", "detail", { id: brand.manufacturerId })}
            onClick={() => setSelectedManufacturerForDetails?.({ manufacturerId: brand.manufacturerId })}
            className="text-[#1565c0] font-medium text-sm"
            title={brand?.manufacturerName}
          >
            {displayFormat(brand?.manufacturerName)}
          </ModuleLink>
        ) : (
          <span
            className="text-sm font-medium text-gray-900"
            title={brand?.manufacturerName}
          >
            {displayFormat(brand?.manufacturerName)}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {displayFormat(brand?.addedDateFormatted, "DATE")}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={brand?.status} />
      </td>
    </tr>
  );
}
