"use client";

import { useAuth } from "@/context/AuthContext";
import { Building2 } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import companyConfig from "@/config/company.config.json";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";

export default function CompanyTableRow({ item, onRowAction, setSelectedItemForDetails }) {
  const { can } = useAuth();

  const hasViewPerm = can(companyConfig.permissions?.view);
  const isActive = item.status === "Active";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 text-sm">
        <SharedImageZoom
          id={`table-company-${item.id}`}
          src={item.logoUrl}
          alt={item.companyName}
          placeholderText={<Building2 size={18} />}
          thumbnailClassName="h-10 w-10 rounded-xl object-cover border border-gray-100"
          modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
        />
      </td>

      <td className="px-4 py-3 text-sm">
        {hasViewPerm ? (
          <ModuleLink
            href={buildRoute("company", "detail", { id: item.id })}
            onClick={() =>
              setSelectedItemForDetails && setSelectedItemForDetails(item)
            }
            className="font-semibold text-[#1565c0] hover:underline cursor-pointer"
          >
            {item.companyName || "—"}
          </ModuleLink>
        ) : (
          <span className="font-semibold text-gray-800">
            {item.companyName || "—"}
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {item.shortName || "—"}
      </td>

      <td className="px-4 py-3 text-sm">
        <span className="font-mono text-xs text-gray-600 ">
          {item.companyCode || "—"}
        </span>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {item.contactPersonName || "—"}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700 truncate">
        <span title={item.email}>{item.email || "—"}</span>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {item.fullPhoneNumber || "—"}
      </td>

      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {item.addedDateFormatted || "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
          />
          {item.status || "—"}
        </span>
      </td>
    </tr>
  );
}