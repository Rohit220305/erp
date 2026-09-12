"use client";

import {
  FileText,
  Package,
  Workflow,
  ShoppingCart,
  Truck,
  BarChart3,
  ListFilter,
  History,
  Receipt,
  ShieldCheck,
  StickyNote,
  Activity,
  Menu,
} from "lucide-react";
import { getStatusDisplay } from "@/utils/status-formatter";

export default function ProductionBatchSidebar({
  batchData,
  activeTab = "SUMMARY",
  setActiveTab,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Waiting for Stock":
        return "text-orange-600";
      case "Pending":
        return "text-orange-600";
      case "In Progress":
        return "text-purple-600";
      case "Completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const navItems = [
    { id: "SUMMARY", label: "Summary", icon: FileText },
    { id: "ITEM_DETAILS", label: "Item Details", icon: Package },
    { id: "PROCESS_ITEM_DETAILS", label: "Process Item Details", icon: Workflow },
    { id: "MATERIAL_REQUEST", label: "Material Request", icon: ShoppingCart },
    // { id: "OUT_BOUND", label: "Production Out-Bound", icon: Truck },
    // { id: "COST_REPORT", label: "Batch Cost Report", icon: BarChart3 },
    // { id: "CONSUMPTION_LOG", label: "Consumption Log", icon: ListFilter },
    // { id: "TIMELINE", label: "Timeline", icon: History },
    // { id: "FINANCE_VOUCHERS", label: "Finance Vouchers", icon: Receipt },
    // { id: "QUALITY_AUDIT", label: "Quality Audit", icon: ShieldCheck },
  ];

  return (
    <div className="w-64 shrink-0 space-y-3">
      <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-[14px] text-gray-900 leading-snug">
              {batchData?.batchCode || "HPR/----/--/-----"}
            </h2>
            
          </div>
          
        </div>
      </div>

      <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm space-y-1">
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
      {/* <div className="space-y-2">
        <div className="bg-gray-100/80 rounded-md p-2.5 flex items-center justify-between text-[14px] text-gray-700 font-medium border border-gray-200/60">
          <div className="flex items-center gap-2">
            <StickyNote size={15} className="text-gray-500" />
            <span>Notes</span>
          </div>
          <span className="bg-white px-2 py-0.5 rounded text-[11px] font-bold text-gray-700 shadow-xs border border-gray-200">
            0
          </span>
        </div>

        <div className="bg-gray-100/80 rounded-md p-2.5 flex items-center justify-between text-[14px] text-gray-700 font-medium border border-gray-200/60">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-gray-500" />
            <span>Activities</span>
          </div>
          <span className="bg-white px-2 py-0.5 rounded text-[11px] font-bold text-gray-700 shadow-xs border border-gray-200">
            1
          </span>
        </div>
      </div> */}
      </div>
    </div>
  );
}
