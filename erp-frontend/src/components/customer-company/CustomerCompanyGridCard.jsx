"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import StatusBadge from "@/components/common/StatusBadge";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Building2 } from "lucide-react";

export default function CustomerCompanyGridCard({
  item,
  config,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails, 
}) {
  const { can, user } = useAuth();

  if (!item) return null;

  const canView = can(CAPABILITIES.CUSTOMER_COMPANY?.VIEW || "CUSTOMER_COMPANY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex flex-shrink-0 items-center justify-center border border-gray-200 overflow-hidden">
            {item?.logoUrl ? (
              <SharedImageZoom
                id={`grid-card-${item.id}`}
                src={item.logoUrl}
                alt={item.name}
                thumbnailClassName="w-12 h-12 rounded-full object-cover"
                modalImageClassName="w-64 h-64 rounded-full"
              />
            ) : (
              <Building2 className="text-gray-400 w-6 h-6" />
            )}
          </div>
          <div className="min-w-0">
            {canView ? (
              <ModuleLink
                href={buildRoute("customer-company", "detail", { id: item.id })}
                onClick={setSelectedItemForDetails ? () => setSelectedItemForDetails(item) : null}
                className="text-[15px] font-bold text-[#1565c0] hover:underline truncate block"
              >
                {displayFormat(item.name)}
              </ModuleLink>
            ) : (
              <p className="text-[15px] font-bold text-gray-900 truncate">
                {displayFormat(item.name)}
              </p>
            )}
            <p className="text-xs text-gray-500 font-mono mt-0.5">{displayFormat(item.code)}</p>
          </div>
        </div>
        <StatusBadge status={item.status} className="shrink-0" />
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
          <span className="text-gray-400">Email</span>
          <span className="text-gray-900 truncate font-medium">
            {displayFormat(item.email)}
          </span>
        </div>

        {user?.isSuperAdmin && (
          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <span className="text-gray-400">Company</span>
            {item.companyId && canViewCompany && setSelectedCompanyForDetails ? (
              <ModuleLink
                href={buildRoute("company", "detail", { id: item.companyId })}
                onClick={() => setSelectedCompanyForDetails({ companyId: item.companyId })}
                className="text-[#1565c0] hover:underline truncate"
              >
                {displayFormat(item.companyName)}
              </ModuleLink>
            ) : (
              <span className="text-gray-900 truncate">
                {displayFormat(item.companyName)}
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-[100px_1fr] items-center gap-2">
          <span className="text-gray-400">Added Date</span>
          <span className="text-gray-900 truncate">
            {displayFormat(item.addedDateFormatted, "DATE")}
          </span>
        </div>
      </div>
    </div>
  );
}
