"use client";

import { useAuth } from "@/context/AuthContext";
import ActionRenderer from "@/components/core/dynamic-ui/ActionRenderer";
import currencyConfig from "@/config/currency.config.json";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";


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
            {displayFormat(item.currencyName)}
          </ModuleLink>
        ) : (
          <span className="font-medium text-gray-800">{displayFormat(item.currencyName)}</span>
        )}
      </td>

      <td className="px-4 py-3 text-sm">
        <span className="font-mono text-gray-700 tracking-wide text-xs font-semibold">
          {displayFormat(item.currencyCode)}
        </span>
      </td>


      <td className="px-4 py-3 text-sm">
        <span className="inline-flex items-center justify-center w-8 h-8   text-base   ">
          {displayFormat(item.currencySymbol)}
        </span>
      </td>

      <td className="px-4 py-3 text-sm">
        <StatusBadge status={item.status} />
      </td>

    
    </tr>
  );
}
