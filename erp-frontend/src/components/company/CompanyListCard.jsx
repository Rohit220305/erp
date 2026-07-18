"use client";

import { useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { resolvePath } from "@/components/core/dynamic-ui/utils/pathResolver";

import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function CompanyListCard({ item, config, setSelectedItemForDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { can } = useAuth();

  const listConfig = config.listCard;
  if (!listConfig) return null;

  const logoUrl = resolvePath(item, listConfig.primary.image);
  const title = resolvePath(item, listConfig.primary.title);
  const subtitle = resolvePath(item, listConfig.primary.subtitle);

  return (
    <div className=" mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
              Company
            </p>
            <div className="flex items-center gap-3">
              <SharedImageZoom
                id={`company-list-${item.id}`}
                src={logoUrl}
                alt={title}
                placeholderText={<Building2 size={18} />}
                thumbnailClassName="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
              />
              <div className="min-w-0">
                {can(config.permissions?.view || "COMPANY_VIEW") ? (
                  <span
                    onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
                    className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-semibold text-sm truncate"
                  >
                    {title || "—"}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {title || "—"}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5 no-underline truncate">
                  {subtitle || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Configurable Columns - all equal width */}
          {listConfig.columns.map((col, idx) => (
            <div key={idx} className="flex-1 ms-5 min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                {col.label}
              </p>
              <div className="text-[13px] text-gray-800 font-medium truncate">
                {item[col.key] || "—"}
              </div>
            </div>
          ))}

          {/* Chevron - fixed size, not a flex column */}
          <div
            className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-400 ${isExpanded ? "rotate-180" : ""}`}
              size={20}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 flex items-start bg-white">
            {listConfig.expanded.map((col, idx) => (
              <div key={idx} className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  {col.label}
                </p>
                <p className="text-[13px] text-gray-800 font-medium truncate">
                  {item[col.key] || "—"}
                </p>
              </div>
            ))}

            <div className="flex-shrink-0 ml-4 w-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
