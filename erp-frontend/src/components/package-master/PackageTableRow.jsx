"use client";

import { useAuth } from "@/context/AuthContext";
import { Check, X } from "lucide-react";

export default function PackageTableRow({ item, onRowAction, setSelectedItemForDetails }) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can("PACKAGE_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <button
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {item.packageName}
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.packageName}
          </span>
        )}
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[250px] max-w-[250px] truncate">
          <span className="text-sm text-gray-700" title={item.companyName}>
            {item.companyName || "—"}
          </span>
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {item.packageCode}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {item.abbreviation || "—"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-700">
          {item.addedByName || "System"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-500">
          {item.addedDateFormatted || "—"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
