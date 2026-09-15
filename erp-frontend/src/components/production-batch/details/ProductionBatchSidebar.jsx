"use client";

import {
  FileText,
  Package,
  Workflow,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";

export default function ProductionBatchSidebar({
  batchData,
  activeTab = "SUMMARY",
  setActiveTab,
}) {
  const navItems = [
    { id: "SUMMARY", label: "Summary", icon: FileText },
    { id: "ITEM_DETAILS", label: "Item Details", icon: Package },
    { id: "PROCESS_ITEM_DETAILS", label: "Process Item Details", icon: Workflow },
    { id: "MATERIAL_REQUEST", label: "Material Request", icon: ShoppingCart },
    { id: "CONSUMPTION_LOG", label: "Consumption Log", icon: ClipboardList },
  ];

  return (
    <div className="w-64 shrink-0 space-y-3 h-full pb-4">
      <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-[14px] text-gray-900 leading-snug">
              {batchData?.batchCode }
            </h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm space-y-1 h-full  ">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#1565c0] text-white shadow-sm font-semibold"
                  : "text-gray-700 hover:bg-gray-100/70"
              }`}
            >
              <Icon size={16} className={isActive ? "text-white" : "text-gray-500"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
