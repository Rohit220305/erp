"use client";

import { useRouter } from "next/navigation";
import { Building2, Calendar } from "lucide-react";

export default function UserListCard({ user }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/admin/${user.id}`)}
      className="bg-white px-5 py-3.5 flex items-center gap-5 border-b border-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer group"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1565c0]/15 to-[#1565c0]/30 text-[#1565c0] flex items-center justify-center font-semibold text-sm border-2 border-[#1565c0]/10">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
        )}
      </div>

      {/* Name + username */}
      <div className="min-w-0 w-44 shrink-0">
        <p className="font-semibold text-sm text-gray-900 group-hover:text-[#1565c0] transition-colors truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">@{user.userName || "—"}</p>
      </div>

      {/* Email */}
      <div className="text-xs text-gray-500 min-w-0 flex-1 truncate">
        {user.email || "—"}
      </div>

      {/* Company */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 w-36 shrink-0 truncate">
        <Building2 size={12} className="shrink-0 text-gray-400" />
        <span className="truncate">{user.companyName || "—"}</span>
      </div>

      {/* Group */}
      <div className="w-28 shrink-0">
        {user.groupName && (
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-[#1565c0] border border-blue-200 rounded-full font-medium truncate block w-fit max-w-full">
            {user.groupName}
          </span>
        )}
      </div>

      {/* Last Login */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 w-28 shrink-0">
        <Calendar size={11} className="shrink-0" />
        <span className="truncate">{user.lastLoginDateFormatted || "Never"}</span>
      </div>

      {/* Status + Super Admin */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            user.status === "Active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-red-50 text-red-600 border border-red-200"
          }`}
        >
          {user.status}
        </span>
        {/* {user.isSuperAdmin ? (
          <span className="px-2 py-0.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-semibold">
            SA
          </span>
        ) : null} */}
      </div>
    </div>
  );
}
