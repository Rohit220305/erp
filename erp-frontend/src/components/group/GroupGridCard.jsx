"use client";

import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";

export default function GroupGridCard({ group, onDelete }) {
  const router = useRouter();
  const isActive = group.status === "Active" || group.status === "active";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.push(`/group/${group.id}`)}
        >
          {/* <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-full bg-[#1565c0] text-white flex items-center justify-center font-bold text-xl">
              {group.groupName?.[0] || "G"}
            </div>
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isActive ? "bg-green-500" : "bg-gray-300"}`}></div>
          </div> */}
          <div>
            <p className="text-[#1565c0] font-medium leading-tight mb-0.5 hover:underline decoration-1 underline-offset-2">
              {group.groupName || "—"}
            </p>
            <p className="text-gray-400 text-sm mt-4 leading-tight">
              {group.groupCode || "—"}
            </p>
          </div>
        </div>
    
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-6 text-sm">
        {group.description && (
          <div className="grid grid-cols-[110px_1fr] gap-2">
            <span className="text-gray-400">Description</span>
            <span className="text-gray-900 line-clamp-2">{group.description}</span>
          </div>
        )}
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <span className="text-gray-400">Added Date</span>
          <span className="text-gray-900 truncate">{group.addedDateFormatted || "—"}</span>
        </div>
      </div>
    </div>
  );
}
