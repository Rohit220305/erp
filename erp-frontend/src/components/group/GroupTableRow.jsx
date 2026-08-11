"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function GroupTableRow({ item, onRowAction, setSelectedItemForDetails }) {
  const { can } = useAuth();
  const router = useRouter();
  
  const hasViewPerm = can(CAPABILITIES.GROUP.VIEW);
  const isActive = item.status === "Active" || item.status === "active";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <div>
            {hasViewPerm ? (
              <p  
                className="font-medium text-[#1565c0] hover:underline cursor-pointer text-sm"
                onClick={() => router.push(`/group/${item.id}`)}
              >
                {item.groupName || "—"}
              </p>
            ) : (
              <p className="font-medium text-gray-800 text-sm">
                {item.groupName || "—"}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {item.groupCode || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {item.description || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {item.addedDateFormatted || "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
