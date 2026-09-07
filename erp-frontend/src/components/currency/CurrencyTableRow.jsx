"use client";

import { useAuth } from "@/context/AuthContext";
import ActionRenderer from "@/components/core/dynamic-ui/ActionRenderer";
import currencyConfig from "@/config/currency.config.json";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";


export default function CurrencyTableRow({ item, onRowAction, setSelectedItemForDetails }) {
  const { can } = useAuth();

  const hasViewPerm = can(currencyConfig.permissions?.view);
  const isActive    = item.status === "Active";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">

      <td className="px-4 py-3 text-sm">
        {hasViewPerm ? (
          <ModuleLink
            href={buildRoute("currency", "detail", { id: item.id })}
            onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
            className="font-medium text-[#1565c0]"
          >
            {item.currencyName || "—"}
          </ModuleLink>
        ) : (
          <span className="font-medium text-gray-800">{item.currencyName || "—"}</span>
        )}
      </td>

      <td className="px-4 py-3 text-sm">
        <span className="font-mono text-gray-700 tracking-wide text-xs font-semibold">
          {item.currencyCode || "—"}
        </span>
      </td>


      <td className="px-4 py-3 text-sm">
        <span className="inline-flex items-center justify-center w-8 h-8   text-base   ">
          {item.currencySymbol || "—"}
        </span>
      </td>

      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          {item.status || "—"}
        </span>
      </td>

    
    </tr>
  );
}
