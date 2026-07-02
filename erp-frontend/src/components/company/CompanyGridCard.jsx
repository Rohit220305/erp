"use client";

import { useRouter } from "next/navigation";
import { Mail, Phone, Building2, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { resolvePath } from "@/components/core/dynamic-ui/utils/pathResolver";
import CellRenderer from "@/components/core/dynamic-ui/CellRenderer";

const IconMap = {
  Mail,
  Phone,
};

export default function CompanyGridCard({ company, companyConfig }) {
  const router = useRouter();
  const { can } = useAuth();
  const hasViewPerm = can(companyConfig.permissions?.view || "COMPANY_VIEW");

  const config = companyConfig.gridCard;
  if (!config) return null;

  const logoUrl = resolvePath(company, config.header.image);
  const title = resolvePath(company, config.header.title);
  const subtitle = resolvePath(company, config.header.subtitle);
  const badgeValue = resolvePath(company, config.header.badge);

  return (
    <div
      onClick={() => hasViewPerm && router.push(`/company/${company.id}`)}
      className={`bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200 group flex flex-col h-full ${
        hasViewPerm ? "cursor-pointer hover:-translate-y-1" : ""
      }`}
    >
      {/* Header: logo/avatar + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={title}
              className="w-11 h-11 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15 shrink-0">
              <Building2 size={20} className="text-[#1565c0]" />
            </div>
          )}
          <div className="min-w-0">
            <p
              className={`font-semibold text-gray-900 text-sm truncate leading-tight  transition-colors ${hasViewPerm ? "group-hover:text-[#1565c0]" : ""}`}
            >
              {title || "—"}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {subtitle || "—"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
            badgeValue === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {badgeValue || "—"}
        </span>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 flex-grow">
        {config.details.map((detail, idx) => {
          const val = resolvePath(company, detail.key);
          if (!val) return null;

          const Icon = IconMap[detail.icon];
          return (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              {Icon && <Icon size={12} className="shrink-0 text-gray-400" />}
              <span className="truncate">
                <CellRenderer item={company} column={detail} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {resolvePath(company, config.footer.date) || ""}
        </p>
        {hasViewPerm && (
          <span className="text-xs text-[#1565c0] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View <ExternalLink size={11} />
          </span>
        )}
      </div>
    </div>
  );
}
