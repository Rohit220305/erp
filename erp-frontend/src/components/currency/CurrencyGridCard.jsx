"use client";

import { useAuth } from "@/context/AuthContext";


export default function CurrencyGridCard({ item, config, setSelectedItemForDetails }) {
  const { can } = useAuth();

  const viewPermission = config.permissions?.view;
  const hasViewPerm    = !viewPermission || can(viewPermission);

  const isActive = item.status === "Active";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col">

      <div
        className={`flex items-center gap-4 mb-4 ${hasViewPerm ? "cursor-pointer group" : ""}`}
        onClick={() => hasViewPerm && setSelectedItemForDetails && setSelectedItemForDetails(item)}
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-md shadow-blue-200 select-none">
          {item.currencySymbol || item.currencyCode?.[0] || "¤"}
        </div>

        <div className="min-w-0">
          <p
            className={`font-semibold text-sm leading-tight truncate ${
              hasViewPerm
                ? "text-[#1565c0] group-hover:underline"
                : "text-gray-900"
            }`}
          >
            {item.currencyName || "—"}
          </p>
          <p className="text-gray-400 text-xs mt-1 font-mono tracking-wide">
            {item.currencyCode || "—"}
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-4" />

      <div className="space-y-2 text-sm flex-1">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">Symbol</span>
          <span className="text-gray-900 font-semibold text-base">
            {item.currencySymbol || "—"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
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
  );
}
