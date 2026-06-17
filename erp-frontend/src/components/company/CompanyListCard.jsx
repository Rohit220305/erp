"use client";

import { useRouter } from "next/navigation";
import { Mail, Phone, Building2, Calendar } from "lucide-react";

export default function CompanyListCard({ company }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/company/${company.id}`)}
      className="bg-white px-5 py-4 flex items-center gap-5 border-b border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer group"
    >
      {/* Logo / Avatar */}
      {company.logoUrl ? (
        <img
          src={company.logoUrl}
          alt={company.companyName}
          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15 shrink-0">
          <Building2 size={18} className="text-[#1565c0]" />
        </div>
      )}

      {/* Name + Short Name */}
      <div className="min-w-0 w-44 shrink-0">
        <p className="font-semibold text-sm text-gray-900 group-hover:text-[#1565c0] transition-colors truncate">
          {company.companyName || "—"}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">{company.shortName || "—"}</p>
      </div>

      {/* Email */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0 flex-1">
        <Mail size={12} className="shrink-0 text-gray-400" />
        <span className="truncate">{company.email || "—"}</span>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 w-36 shrink-0">
        <Phone size={12} className="shrink-0 text-gray-400" />
        <span className="truncate">
          {company.phone ? `${company.dialCode || ""} ${company.phone}` : "—"}
        </span>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 w-28 shrink-0">
        <Calendar size={12} className="shrink-0" />
        <span>{company.addedDateFormatted || "—"}</span>
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            company.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {company.status || "—"}
        </span>
      </div>
    </div>
  );
}
