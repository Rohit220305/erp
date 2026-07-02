"use client";

import { useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
// import companyConfig from "@/config/company.config.json";
import CellRenderer from "@/components/core/dynamic-ui/CellRenderer";
import { resolvePath } from "@/components/core/dynamic-ui/utils/pathResolver";

export default function CompanyListCard({ company, companyConfig }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { can } = useAuth();

  const config = companyConfig.listCard;
  if (!config) return null;

  const logoUrl = resolvePath(company, config.primary.image);
  const title = resolvePath(company, config.primary.title);
  const subtitle = resolvePath(company, config.primary.subtitle);

  // console.log("Rendering CompanyListCard for company:", company, "with config:", companyConfig);

  return (
    <div className=" px-4 py-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          {/* Primary Column */}  
          <div className="flex-[1.5]">
            <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
              Company
            </p>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={title}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15 shrink-0">
                  <Building2 size={18} className="text-[#1565c0]" />
                </div>
              )}
              <div>
                {can(companyConfig.permissions?.view || "COMPANY_VIEW") ? (
                  <Link
                    href={`/company/${company.id}`}
                    className="block w-fit text-[#1565c0] "
                  >
                    <p className="text-sm font-semibold hover:underline">
                      {title || "—"}
                    </p>
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-gray-800">
                    {title || "—"}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5 no-underline">
                  {subtitle || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Configurable Columns
           */}
          {config.columns.map((col, idx) => (
            <div
              key={idx}
              className={
                idx === config.columns.length - 1 ? "flex-[1.5]" : "flex-1"
              }
            >
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                {col.label}
              </p>
              <div className="text-[13px] text-gray-800 font-medium">
                <CellRenderer item={company} column={col} />
              </div>
            </div>
          ))}

          {/* Chevron */}
          <div
            className="ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-400 ${isExpanded ? "rotate-180" : ""}`}
              size={20}
            />
          </div>
        </div>

        {/* Expanded Content */}
        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 flex items-start bg-white">
            {config.expanded.map((col, idx) => (
              <div
                key={idx}
                className={
                  idx === 0 || idx === config.expanded.length - 1
                    ? "flex-[1.5]"
                    : "flex-1"
                }
              >
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  {col.label}
                </p>
                <p className="text-[13px] text-gray-800 font-medium">
                  <CellRenderer item={company} column={col} />
                </p>
              </div>
            ))}

            {/* Spacer for Chevron alignment */}
            <div className="ml-4 w-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
