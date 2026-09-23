"use client";

import { useAuth } from "@/context/AuthContext";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";


export default function CurrencyGridCard({ item, config, setSelectedItemForDetails }) {
  const { can } = useAuth();

  const viewPermission = config.permissions?.view;
  const hasViewPerm    = !viewPermission || can(viewPermission);

  const isActive = item.status === "Active";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col">

      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md shadow-blue-200 select-none">
          {item.currencySymbol || item.currencyCode?.[0] || "¤"}
        </div>

        <div className="min-w-0">
          {hasViewPerm ? (
            <ModuleLink
              href={buildRoute("currency", "detail", { id: item.id })}
              onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
              className="font-semibold text-sm leading-tight truncate text-[#1565c0] block"
            >
              {displayFormat(item.currencyName)}
            </ModuleLink>
          ) : (
            <p className="font-semibold text-sm leading-tight truncate text-gray-900">
              {displayFormat(item.currencyName)}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1 font-mono tracking-wide">
            {displayFormat(item.currencyCode)}
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-4" />

      <div className="space-y-2 text-sm flex-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">Symbol</span>
          <span className="text-gray-900 font-semibold text-base">
            {displayFormat(item.currencySymbol)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
        <StatusBadge status={item.status} />
      </div>

    </div>
  );
}
