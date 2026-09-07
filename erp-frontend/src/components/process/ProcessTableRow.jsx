"use client";

import { useAuth } from "@/context/AuthContext";
import { Tag } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";

export default function ProcessTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
  setSelectedWorkCentreForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const canView = can("PROCESS_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          {item.imageUrl ? (
            <SharedImageZoom
              id={`row-${item.id}`}
              src={item.imageUrl}
              alt={item.processName}
              thumbnailClassName="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <Tag className="text-gray-400 w-5 h-5" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("process", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
          >
            {item.processName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.processName}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {item.processCode || "—"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
        {item.workCentreName ? (
          <ModuleLink
            href={buildRoute("work-centre", "detail", { id: item.workCentreId })}
            onClick={() => setSelectedWorkCentreForDetails?.({ workCentreId: item.workCentreId })}
            className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
            title={item.workCentreName}
          >
            {item.workCentreName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">—</span>
        )}
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
          {item.companyName ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={() => setSelectedCompanyForDetails?.({ companyId: item.companyId })}
              className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
              title={item.companyName}
            >
              {item.companyName}
            </ModuleLink>
          ) : (
            <span className="text-sm font-medium text-gray-900">—</span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {item.addedDateFormatted || "-"}
          </span>
        </div>
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
