"use client";

import { useAuth } from "@/context/AuthContext";


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
              <span
                onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
                className="block font-semibold text-sm text-[#1565c0] hover:underline cursor-pointer truncate leading-snug"
              >
                {item.currencyName || "—"}
              </span>
            ) : (
              <p className="font-semibold text-sm text-gray-800 truncate leading-snug">
                {item.currencyName || "—"}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-0.5 font-mono tracking-wide">
              {item.currencyCode || "—"}
            </p>
          </div>

          <div className="flex-1 min-w-0 hidden sm:block">
            <p className="text-[10px] text-gray-400 mb-1 tracking-widest font-semibold uppercase">
              Symbol
            </p>
            <p className="text-sm text-gray-800 font-medium">
              {item.currencySymbol || "—"}
            </p>
          </div>

          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {item.status || "—"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
