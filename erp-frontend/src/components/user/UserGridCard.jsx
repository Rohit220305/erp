"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function UserGridCard({ user, handleLoginAs, currentUser, can, setSelectedUserForDetails, setSelectedUserForPasswordReset, setSelectedCompanyForDetails }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div
          className={`flex items-center gap-3 ${can("USER_VIEW") ? "cursor-pointer" : ""}`}
          onClick={() => {
            if (can("USER_VIEW")) {
              setSelectedUserForDetails(user);
            }
          }}
        >
          <div className="relative shrink-0">
            <SharedImageZoom
              id={`grid-${user.id}`}
              src={user.photoUrl}
              alt={`${user.firstName} ${user.lastName}`}
              placeholderText={`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
              thumbnailClassName="w-14 h-14 rounded-full object-cover border border-gray-100"
              modalImageClassName="w-64 h-64 rounded-full"
            />
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.status === "Active" ? "bg-green-500" : "bg-red-500"}`}
            ></div>
          </div>
          <div>
            <p className="text-[#1565c0] font-medium leading-tight mb-0.5 hover:underline decoration-1 underline-offset-2">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-gray-400 text-sm leading-tight">
              {user.email || "—"}
            </p>
          </div>
        </div>


      </div>

      <hr className="border-gray-100 my-4" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Group Name</p>
          <p className="text-gray-900 font-medium text-sm">
            {user.groupName || "—"}
          </p>
        </div>

        {currentUser?.isSuperAdmin && user.id !== currentUser?.id && (
          <div className="relative">
            <div className="flex rounded-md border border-[#1565c0] bg-white overflow-hidden shrink-0 ">
              <button
                className="px-4 py-1.5 text-sm font-medium text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoginAs(user.id);
                }}
              >
                Login As
              </button>
              <button
                className="px-2 border-l cursor-pointer border-[#1565c0] text-[#1565c0] hover:bg-blue-50 transition-colors flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                {dropdownOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-[#1565c0] rounded-md shadow-sm z-10 w-36 overflow-hidden">
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUserForPasswordReset(user);
                    setDropdownOpen(false);
                  }}
                >
                  Reset Password
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <span className="text-gray-400">User Name</span>
          <span className="text-gray-900 truncate">{user.userName || "—"}</span>
        </div>
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <span className="text-gray-400">Company Name</span>
          {can("COMPANY_VIEW") ? (
            <span
              className="text-[#1565c0] font-medium truncate hover:underline cursor-pointer"
              onClick={() => setSelectedCompanyForDetails(user)}
            >
              {user.companyName || "—"}
            </span>
          ) : (
            <span className="text-gray-900 truncate">{user.companyName || "—"}</span>
          )}
        </div>
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <span className="text-gray-400">Last Login</span>
          <span className="text-gray-900 truncate">
            {user.lastLoginDateFormatted || "Never logged in"}
          </span>
        </div>
      </div>
    </div>
  );
}
