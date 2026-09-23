"use client";

import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Building2 } from "lucide-react";
import { displayFormat } from "@/utils/no-data-formatter";

export default function CompanyGridCard({ item, config, setSelectedItemForDetails }) {
  const { can } = useAuth();
  if (!item) return null;

  const viewPerm = config?.permissions?.view || "COMPANY_VIEW";
  const hasViewPerm = can(viewPerm);
  const isActive = item.status === "Active";

  const formattedPhone = item.phone ? `${item.dialCode || ""} ${item.phone}`.trim() : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div
          className={`flex items-center gap-3 ${hasViewPerm ? "cursor-pointer" : ""}`}
          onClick={() =>
            hasViewPerm &&
            setSelectedItemForDetails &&
            setSelectedItemForDetails(item)
          }
        >
          <div className="relative shrink-0">
            <SharedImageZoom
              id={`company-grid-${item.id}`}
              src={item.logoUrl}
              alt={item.companyName}
              placeholderText={<Building2 size={18} />}
              thumbnailClassName="w-14 h-14 rounded-xl object-cover border border-gray-100"
              modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                isActive ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
          <div>
            <p
              className={`font-medium leading-tight mb-0.5 ${
                hasViewPerm
                  ? "text-[#1565c0] hover:underline decoration-1 underline-offset-2"
                  : "text-gray-900"
              }`}
            >
              {displayFormat(item.companyName)}
            </p>
            <p className="text-gray-400 text-sm mt-2 leading-tight">
              {displayFormat(item.shortName || item.companyCode)}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-3 text-sm">
        {item.email && (
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-900 truncate" title={item.email}>
              {displayFormat(item.email)}
            </span>
          </div>
        )}

        {formattedPhone && (
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400">Phone</span>
            <span className="text-gray-900 truncate">{displayFormat(formattedPhone)}</span>
          </div>
        )}

        {item.addedDateFormatted && (
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400">Added date</span>
            <span className="text-gray-900 truncate">
              {displayFormat(item.addedDateFormatted, "DATE")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
