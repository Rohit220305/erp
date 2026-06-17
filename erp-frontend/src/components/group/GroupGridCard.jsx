"use client";

import { useRouter } from "next/navigation";
import { Tag, Calendar, ExternalLink } from "lucide-react";

export default function GroupGridCard({ group }) {
  const router = useRouter();

  const isActive = group.status === "active";

  return (
    <div
      onClick={() => router.push(`/group/${group.id}`)}
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
    >
      {/* Icon + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15">
          <Tag size={20} className="text-[#1565c0]" />
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Name + Code */}
      <p className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-[#1565c0] transition-colors">
        {group.groupName || "—"}
      </p>
      <p className="text-xs font-medium text-[#1565c0] mt-0.5 mb-2">
        {group.groupCode || ""}
      </p>

      {/* Description */}
      {group.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {group.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={11} />
          <span>{group.addedDateFormatted || "—"}</span>
        </div>
        <span className="text-xs text-[#1565c0] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ExternalLink size={11} />
        </span>
      </div>
    </div>
  );
}
