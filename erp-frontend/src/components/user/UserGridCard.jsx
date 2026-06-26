"use client";

import { useRouter } from "next/navigation";
import { Mail, Building2, Calendar, ExternalLink } from "lucide-react";

export default function UserGridCard({ user, handleLoginAs, currentUser, can, setSelectedUserForDetails, setSelectedUserForPasswordReset }) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200  group">
      {/* Avatar + Name */}
      <div
        className="flex items-center gap-3 mb-4 cursor-pointer"
        onClick={() => setSelectedUserForDetails(user)}
      >
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.firstName}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1565c0]/15 to-[#1565c0]/30 text-[#1565c0] flex items-center justify-center font-bold text-base border-2 border-[#1565c0]/10 shadow-sm">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-[#1565c0] transition-colors">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            @{user.userName || "—"}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex justify-between gap-1.5 mb-3">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              user.status === "Active"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}
          >
            {user.status || "—"}
          </span>

          {user.groupName && (
            <span className="px-2 py-0.5 text-xs bg-blue-50 text-[#1565c0] border border-blue-200 rounded-full font-medium">
              {user.groupName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {currentUser?.isSuperAdmin && user.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLoginAs(user.id);
              }}
              className="px-3 py-1 rounded-full cursor-pointer text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              Login As
            </button>
          )}
          {currentUser?.isSuperAdmin && user.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForPasswordReset(user);
              }}
              className="px-3 py-1 rounded-full text-xs cursor-pointer font-medium bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              Reset Pwd
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        {user.email && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={12} className="shrink-0 text-gray-400" />
            <span className="truncate">{user.email}</span>
          </div>
        )}
        {user.companyName && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Building2 size={12} className="shrink-0 text-gray-400" />
            <span className="truncate">{user.companyName}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={11} />
          <span>{user.lastLoginDateFormatted || "Never logged in"}</span>
        </div>
        {/* <div className="flex items-center gap-2">
          {currentUser?.isSuperAdmin && user.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLoginAs(user.id);
              }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              Login As
            </button>
          )}
          {currentUser?.isSuperAdmin && user.id !== currentUser?.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForPasswordReset(user);
              }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-white hover:bg-gray-800 transition"
            >
              Reset Pwd
            </button>
          )}
          <span className="text-xs text-[#1565c0] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View <ExternalLink size={11} />
          </span>
        </div> */}
      </div>
    </div>
  );
}
