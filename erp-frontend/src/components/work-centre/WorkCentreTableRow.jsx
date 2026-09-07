"use client";

import { useAuth } from "@/context/AuthContext";
import { Factory, Tag } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";

export default function WorkCentreTableRow({
  item,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
  setSelectedWorkCentreCategoryForDetails,
}) {
  const { can, user } = useAuth();
  const isActive = item.status === "Active" || item.status === "active";
  const isAvailable = item.usageStatus === "Available" || item.usageStatus === "available";
  const canView = can("WORK_CENTRE_VIEW");

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 overflow-hidden">
          {item.imageUrl ? (
            <SharedImageZoom
              id={`row-${item.id}`}
              src={item.imageUrl}
              alt={item.workCentreName}
              thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0"
            />
          ) : (
            <Factory size={24} className="text-gray-500" />
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {canView ? (
          <ModuleLink
            href={buildRoute("work-centre", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails(item)}
            className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
          >
            {item.workCentreName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">
            {item.workCentreName}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-sm font-mono text-gray-900 px-2 py-1 ">
            {item.workCentreCode || "—"}
          </span>
        </div>
      </td>
      {user?.isSuperAdmin && (
        <td className="px-6 py-4 whitespace-nowrap min-w-[200px] max-w-[200px] truncate">
          {item.companyName ? (
            <ModuleLink
              href={buildRoute("company", "detail", { id: item.companyId })}
              onClick={() =>
                setSelectedCompanyForDetails?.({ companyId: item.companyId })
              }
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
      <td className="px-6 py-4 whitespace-nowrap min-w-[180px] max-w-[180px] truncate">
        {item.categoryName ? (
          <ModuleLink
            href={buildRoute("work-centre-category", "detail", {
              id: item.categoryId,
            })}
            onClick={() =>
              setSelectedWorkCentreCategoryForDetails?.({
                categoryId: item.categoryId,
              })
            }
            className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
            title={item.categoryName}
          >
            {item.categoryName}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isAvailable
              ? "bg-green-100 text-green-700"
              : item.usageStatus === "Inuse"
                ? "bg-blue-100 text-blue-700"
                : "bg-orange-100 text-orange-700"
          }`}
        >
          {item.usageStatus}
        </span>
      </td>
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
