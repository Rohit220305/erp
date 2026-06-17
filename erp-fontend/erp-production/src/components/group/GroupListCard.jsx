"use client";

import { useRouter } from "next/navigation";
import { Tag, Calendar } from "lucide-react";

export default function GroupListCard({ group }) {
  const router = useRouter();

  const isActive = group.status === "active";

  return (
    <div
      onClick={() => router.push(`/group/${group.id}`)}
      className="bg-white px-5 py-4 flex items-center gap-5 border-b border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer group"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1565c0]/10 to-[#1565c0]/20 flex items-center justify-center border border-[#1565c0]/15 shrink-0">
        <Tag size={16} className="text-[#1565c0]" />
      </div>

      {/* Code */}
      <div className="w-28 shrink-0">
        <p className="text-xs text-gray-400 mb-0.5">Code</p>
        <p className="font-semibold text-sm text-[#1565c0]">{group.groupCode || "—"}</p>
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 mb-0.5">Group Name</p>
        <p className="font-semibold text-sm text-gray-900 group-hover:text-[#1565c0] transition-colors truncate">
          {group.groupName || "—"}
        </p>
      </div>

      {/* Description */}
      <div className="min-w-0 flex-1 hidden md:block">
        <p className="text-xs text-gray-400 mb-0.5">Description</p>
        <p className="text-sm text-gray-500 truncate">{group.description || "—"}</p>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 w-28 shrink-0">
        <Calendar size={11} className="shrink-0" />
        <span>{group.addedDateFormatted || "—"}</span>
      </div>

      {/* Status */}
      <div className="shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}
