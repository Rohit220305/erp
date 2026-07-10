"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function UserListCard({ user, can, setSelectedUserForDetails, setSelectedCompanyForDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className=" mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="flex-[1.5]">
            {/* <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
              Name
            </p> */}
            <div className="flex items-center gap-3">
              <SharedImageZoom
                id={`list-${user.id}`}
                src={user.photoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                placeholderText={`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}
                thumbnailClassName="w-10 h-10 rounded-full object-cover border border-gray-100"
                modalImageClassName="w-64 h-64 rounded-full"
              />
              <div>
                {can("USER_VIEW") ? (
                  <p
                    className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer w-fit"
                    onClick={() => setSelectedUserForDetails(user)}
                  >
                    {user.firstName} {user.lastName}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 ms-3">
            <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
              User Name
            </p>
            <p className="text-[13px] text-gray-800 font-medium">
              {user.userName || user.email || "—"}
            </p>
          </div>

          <div className="flex-1 ms-2">
            <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
              Status
            </p>
            <span
              className={`px-3 py-1 rounded text-[11px] font-semibold ${
                user.status === "Active"
                  ? "bg-[#2ecc71] text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {user.status}
            </span>
          </div>

          <div className="flex-[1.5] ms-2">
            <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
              Company Name
            </p>
            {can("COMPANY_VIEW") ? (
              <p
                className="text-[13px] font-medium text-[#1565c0] hover:underline cursor-pointer w-fit"
                onClick={() => setSelectedCompanyForDetails(user)}
              >
                {user.companyName || "—"}
              </p>
            ) : (
              <p className="text-[13px] font-medium text-gray-800">
                {user.companyName || "—"}
              </p>
            )}
          </div>
          <div
            className="ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`text-[#1565c0] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              size={20}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 flex items-start bg-white">
            <div className="flex-[1.5]">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Email
              </p>
              <p className="text-[13px] text-gray-800 font-medium">
                {user.email || "—"}
              </p>
            </div>

            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Contact
              </p>
              <p className="text-[13px] text-gray-800 font-medium">
                {user.phone ? `(+91) ${user.phone}` : "-"}
              </p>
            </div>

            <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Group Name
              </p>
              <p className="text-[13px] text-gray-800 font-medium">
                {user.groupName || "-"}
              </p>
            </div>

            <div className="flex-[1.5]">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Last Access
              </p>
              <p className="text-[13px] text-gray-800 font-medium">
                {user.lastLoginDateFormatted || "-"}
              </p>
            </div>

            <div className="ml-4 w-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
