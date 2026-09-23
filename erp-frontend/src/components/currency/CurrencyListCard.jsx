"use client";

import { useAuth } from "@/context/AuthContext";
import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";


export default function CurrencyListCard({ item, config, setSelectedItemForDetails }) {
  const { can } = useAuth();

  const viewPermission = config.permissions?.view;
  const hasViewPerm    = !viewPermission || can(viewPermission);

  const isActive = item.status === "Active";

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center px-6 py-4 gap-4">

          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xl text-blue-600 select-none">
            {item.currencySymbol || item.currencyCode?.[0] || "¤"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 mb-0.5 tracking-widest font-semibold uppercase">
              {config.moduleName || "Currency"}
            </p>
            {hasViewPerm ? (
              <ModuleLink
                href={buildRoute("currency", "detail", { id: item.id })}
                onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
                className="block font-semibold text-sm text-[#1565c0] truncate leading-snug"
              >
                {displayFormat(item.currencyName)}
              </ModuleLink>
            ) : (
              <p className="font-semibold text-sm text-gray-800 truncate leading-snug">
                {displayFormat(item.currencyName)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5 font-mono tracking-wide">
              {displayFormat(item.currencyCode)}
            </p>
          </div>

          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-[10px] text-gray-400 mb-1 tracking-widest font-semibold uppercase">
              Symbol
            </p>
            <p className="text-sm text-gray-800 font-medium">
              {displayFormat(item.currencySymbol)}
            </p>
          </div>

          <div className="flex-shrink-0">
            <StatusBadge status={item.status} />
          </div>

        </div>
      </div>
    </div>
  );
}
