"use client";

import { useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import ModuleLink from "@/components/common/ModuleLink";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function CustomerCompanyListCard({
  item,
  config,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can, user } = useAuth();

  if (!item) return null;

  const canView = can(CAPABILITIES.CUSTOMER_COMPANY?.VIEW || "CUSTOMER_COMPANY_VIEW");
  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="flex-shrink-0 mr-4">
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
              {item?.logoUrl ? (
                <SharedImageZoom
                  id={`list-card-${item.id}`}
                  src={item.logoUrl}
                  alt={item.name}
                  thumbnailClassName="w-12 h-12 rounded-full object-cover"
                  modalImageClassName="w-64 h-64 rounded-full"
                />
              ) : (
                <Building2 className="text-gray-400 w-6 h-6" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Customer Name
              </p>
              {canView ? (
                <ModuleLink
                  href={buildRoute("customer-company", "detail", {
                    id: item.id,
                  })}
                  onClick={
                    setSelectedItemForDetails
                      ? () => setSelectedItemForDetails(item)
                      : null
                  }
                  className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-bold text-sm truncate"
                >
                  {displayFormat(item.name)}
                </ModuleLink>
              ) : (
                <p className="text-sm font-bold text-gray-800 truncate">
                  {displayFormat(item.name)}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Customer Code
              </p>
              <div className="text-[13px] text-gray-800 font-mono truncate">
                {displayFormat(item.code)}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Email
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {displayFormat(item.email)}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <div
            className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-400 ${
                isExpanded ? "rotate-180" : ""
              }`}
              size={20}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-4 items-start pr-[52px]">
              
              {user?.isSuperAdmin && (
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                    Company
                  </p>
                  {item.companyId && canViewCompany && setSelectedCompanyForDetails ? (
                    <ModuleLink
                      href={buildRoute("company", "detail", {
                        id: item.companyId,
                      })}
                      onClick={() =>
                        setSelectedCompanyForDetails({
                          companyId: item.companyId,
                        })
                      }
                      className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-medium text-[13px] truncate"
                    >
                      {displayFormat(item.companyName)}
                    </ModuleLink>
                  ) : (
                    <div className="text-[13px] text-gray-800 font-medium truncate">
                      {displayFormat(item.companyName)}
                    </div>
                  )}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Added Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(item.addedDateFormatted, "DATE")}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
