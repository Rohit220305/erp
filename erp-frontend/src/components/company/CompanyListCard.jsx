"use client";

import { useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function CompanyListCard({ item, config, setSelectedItemForDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();

  if (!item) return null;

  const viewPerm = config?.permissions?.view || "COMPANY_VIEW";
  const hasViewPerm = can(viewPerm);
  const isActive = item.status === "Active";

  const currencies = Array.isArray(item.currencies)
    ? item.currencies
    : item.currencies
    ? [item.currencies]
    : [];

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-5 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Company
              </p>
              <div className="flex items-center gap-3">
                <SharedImageZoom
                  id={`company-list-${item.id}`}
                  src={item.logoUrl}
                  alt={item.companyName}
                  placeholderText={<Building2 size={18} />}
                  thumbnailClassName="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                  modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
                />
                <div className="min-w-0">
                  {hasViewPerm ? (
                    <span
                      onClick={() =>
                        setSelectedItemForDetails &&
                        setSelectedItemForDetails(item)
                      }
                      className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-semibold text-sm truncate"
                    >
                      {item.companyName || "—"}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {item.companyName || "—"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Company code
              </p>
              <p className="text-[11px] text-gray-00 mt-0.5 no-underline truncate">
                {item.companyCode || "—"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Legal Name
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {item.legalName || "—"}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Registration No.
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {item.registrationNumber || "—"}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
                  />
                  {item.status || "—"}
                </span>
              </div>
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
            <div className="grid grid-cols-5 gap-4 items-start pr-[52px]">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Email
                </p>
                <div
                  className="text-[13px] text-gray-800 font-medium truncate"
                  title={item.email}
                >
                  {item.email || "—"}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Phone
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.phone
                    ? `${item.dialCode || ""} ${item.phone}`.trim()
                    : "—"}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Contact Person
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.contactPersonName || "—"}
                </div>
              </div>

              {/* <div className="min-w-0" /> */}
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Currencies
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {currencies.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {currencies.map((curr, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                        >
                          {typeof curr === "object" && curr !== null
                            ? curr.currencyCode ||
                              curr.code ||
                              curr.currencyName ||
                              "—"
                            : curr}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  Added Date
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {item.addedDateFormatted || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
