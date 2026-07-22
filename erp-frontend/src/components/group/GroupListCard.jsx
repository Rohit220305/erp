"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GroupListCard({ group, can }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const isActive = group.status === "Active" || group.status === "active";

  return (
    <div className=" mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
        <div 
          className="flex items-center px-6 py-4"
        >
          <div className="flex-[1.5]">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Group Name</p>
              <div className="flex items-center gap-3">
               
                <div>
                  {can("GROUP_VIEW") ? (
                    <p 
                      className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer w-fit"
                      onClick={() => router.push(`/group/${group.id}`)}
                    >
                      {group.groupName || "—"}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {group.groupName || "—"}
                    </p>
                  )}
                </div>
              </div>
          </div>
          
          <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Group Code</p>
              <p className="text-[13px] text-gray-800 font-medium">{group.groupCode || "—"}</p>
          </div>
          
          <div className="flex-1">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Status</p>
              <span className={`px-3 py-1 rounded text-[11px] font-semibold ${
                isActive ? "bg-[#2ecc71] text-white" : "bg-red-500 text-white"
              }`}>
                {isActive ? "Active" : "Inactive"}
              </span>
          </div>
          
          <div className="flex-[1.5]">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Added Date</p>
              <p className="text-[13px] font-medium text-gray-800">{group.addedDateFormatted || "—"}</p>
          </div>

          <div 
            className="ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown className={`text-[#1565c0] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} size={20} />
          </div>
        </div>

        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-5 flex items-start bg-white">
              <div className="flex-[4]">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">Description</p>
                <p className="text-[13px] text-gray-800 font-medium">{group.description || "—"}</p>
              </div>
              
              <div className="ml-4 w-5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
