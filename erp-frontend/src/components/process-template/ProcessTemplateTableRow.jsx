"use client";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";

export default function ProcessTemplateTableRow({ item, onRowAction, setSelectedItemForDetails }) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can(CAPABILITIES.PROCESS_TEMPLATE?.VIEW || "PROCESS_TEMPLATE_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <button
            type="button"
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0] hover:text-blue-800 hover:underline cursor-pointer text-left"
          >
            {item.templateName}
          </button>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.templateName}
          </span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-mono text-gray-900 px-2 py-1 bg-gray-50 rounded border border-gray-200">
          {item.templateCode || "—"}
        </span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {item.executionType || "Sequential"}
        </span>
      </td>

      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[180px] max-w-[220px] truncate">
          <span className="text-sm font-medium text-gray-900" title={item.companyName}>
            {item.companyName || "—"}
          </span>
        </td>
      )}

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.addedDateFormatted || "-"}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
