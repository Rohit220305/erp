"use client";

import { useRouter } from "next/navigation";
import { Mail, Phone, Building2, ExternalLink } from "lucide-react";

export default function CompanyGridCard({ company }) {
  const router = useRouter();

  const initials = company.companyName
    ? company.companyName.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div
      onClick={() => router.push(`/company/${company.id}`)}
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
    >
      {/* Header: logo/avatar + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.companyName}
              className="w-11 h-11 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15">
              <Building2 size={20} className="text-[#1565c0]" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate leading-tight group-hover:text-[#1565c0] transition-colors">
              {company.companyName || "—"}
            </p>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {company.shortName || "—"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
            company.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {company.status || "—"}
        </span>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        {company.email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={12} className="shrink-0 text-gray-400" />
            <span className="truncate">{company.email}</span>
          </div>
        )}
        {company.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Phone size={12} className="shrink-0 text-gray-400" />
            <span>{company.dialCode} {company.phone}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">{company.addedDateFormatted || ""}</p>
        <span className="text-xs text-[#1565c0] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ExternalLink size={11} />
        </span>
      </div>
    </div>
  );
}
