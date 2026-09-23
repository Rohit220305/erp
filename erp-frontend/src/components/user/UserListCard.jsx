"use client";

import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function UserListCard({ user, can, setSelectedUserForDetails, setSelectedCompanyForDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  const isActive = user.status === "Active";
  const formattedPhone = user.phone
    ? `${user.dialCode || ""}`.trim()
      ? `${user.dialCode} ${user.phone}`
      : `(+91) ${user.phone}`
    : null;

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-4 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                User
              </p>
              <div className="flex items-center gap-3 min-w-0">
                <SharedImageZoom
                  id={`list-${user.id}`}
                  src={user.photoUrl}
                  alt={user.fullName}
                  placeholderText={user.fullName ? user.fullName.substring(0, 2).toUpperCase() : ""}
                  thumbnailClassName="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0"
                  modalImageClassName="w-64 h-64 rounded-full shadow-2xl"
                />
                <div className="min-w-0">
                  {can(CAPABILITIES.USER.VIEW) ? (
                    <ModuleLink
                      href={buildRoute("user", "detail", { id: user.id })}
                      onClick={() => setSelectedUserForDetails?.(user)}
                      className="text-sm truncate block"
                    >
                      {displayFormat(user.fullName)}
                    </ModuleLink>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayFormat(user.fullName)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                User Name
              </p>
              <p className="text-[13px] text-gray-800 font-medium truncate" title={user.userName || user.email}>
                {displayFormat(user.userName || user.email)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Company Name
              </p>
              {can(CAPABILITIES.COMPANY.VIEW) && setSelectedCompanyForDetails ? (
                <ModuleLink
                  href={user?.companyId ? buildRoute("company", "detail", { id: user.companyId }) : "#"}
                  onClick={() => setSelectedCompanyForDetails(user)}
                  className="text-[13px] font-medium truncate block"
                >
                  {displayFormat(user.companyName)}
                </ModuleLink>
              ) : (
                <p className="text-[13px] font-medium text-gray-800 truncate">
                  {displayFormat(user.companyName)}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <div>
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div
            className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              size={20}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
            <div className="grid grid-cols-4 gap-4 items-start pr-[52px]">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Email
                </p>
                <p className="text-[13px] text-gray-800 font-medium truncate" title={user.email}>
                  {displayFormat(user.email)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Phone
                </p>
                <p className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(formattedPhone)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Group Name
                </p>
                <p className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(user.groupName)}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Last Login
                </p>
                <p className="text-[13px] text-gray-800 font-medium truncate">
                  {displayFormat(user.lastLoginDateFormatted, "DATE")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
