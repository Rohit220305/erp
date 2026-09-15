"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  Workflow,
  Expand,
  X,
} from "lucide-react";
import Loader from "@/components/common/Loader";
import ModuleLink from "@/components/common/ModuleLink";
import { getStatusDisplay } from "@/utils/status-formatter";
import StatusBadge from "@/components/common/StatusBadge";
import { formatQuantityWithUom } from "@/utils/number-formatter";

const ProcessFlowchartContainer = dynamic(
  () => import("@/components/process-template/flowchart/ProcessFlowchartContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-white rounded-xl border border-gray-200 p-8">
        <Loader />
      </div>
    ),
  }
);

export default function ProductionBatchSummaryTab({
  batchData,
  handleOpenProcessDrawer,
  onOpenDrawer,
}) {
  const [isFlowchartModalOpen, setIsFlowchartModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-[14px] font-medium text-gray-700">
            <FileText size={16} className="text-gray-400" />
            <span>Details</span>
            <span className="text-gray-300">|</span>
            <span>Batch Code :</span>
            <span className=" text-gray-900">
              {batchData?.batchCode || "—"}
            </span>
            <span className="text-gray-300">|</span>
            <span>Item Name :</span>
            <ModuleLink
              moduleName="Item"
              id={batchData?.itemId}
              className="text-[#1565c0]   hover:underline"
              onOpenDrawer={onOpenDrawer}
            >
              {batchData?.itemName || "—"}
            </ModuleLink>
          </div>

          <StatusBadge status={batchData?.status} module="production-batch" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8 text-[14px]">
          <div className="space-y-4">
            <div>
              <span className="text-gray-400 block mb-1">Production Request Code</span>
              <ModuleLink
                moduleName="ProductionOrder"
                id={batchData?.productionOrderId}
                className="text-[#1565c0]  hover:underline"
                onOpenDrawer={onOpenDrawer}
              >
                {batchData?.productionOrderCode || "—"}
              </ModuleLink>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Production Qty</span>
              <span className="  text-gray-900 text-[14px]">
                {formatQuantityWithUom(batchData?.batchQuantity || 0, batchData?.uomName || "")}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Requested Date</span>
              <span className="font-medium text-gray-800">
                {batchData?.addedDateFormatted || "—"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-gray-400 block mb-1">Bill Of Material</span>
              <ModuleLink
                moduleName="Bom"
                id={batchData?.bomId}
                className="text-[#1565c0]hover:underline"
                onOpenDrawer={onOpenDrawer}
              >
                {batchData?.bomName || batchData?.bomCode || "—"}
              </ModuleLink>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Qty To Be Packaged</span>
              <span className="  text-gray-900 text-[14px]">
                {formatQuantityWithUom(batchData?.batchQuantity || 0, batchData?.uomName || "")}
              </span>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Batch No</span>
              <span className=" text-xs">
                {batchData?.batchSeqNo || 1}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-gray-400 block mb-1">Process Template</span>
              <ModuleLink
                moduleName="ProcessTemplate"
                id={batchData?.processTemplateId}
                className="text-[#1565c0]   hover:underline"
                onOpenDrawer={onOpenDrawer}
              >
                {batchData?.processTemplateName || "—"}
              </ModuleLink>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">Requested By</span>
              <ModuleLink
                moduleName="User"
                id={batchData?.addedBy}
                className="text-[#1565c0]   hover:underline"
                onOpenDrawer={onOpenDrawer}
              >
                {batchData?.addedByName || "—"}
              </ModuleLink>
            </div>

            <div>
              <span className="text-gray-400 block mb-1">MR Status</span>
              <StatusBadge status={batchData?.materialStatus || "YetToRequest"} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 text-[14px]">
          <div className="flex items-center gap-2   text-gray-900">
            <Workflow size={16} className="text-gray-500" />
            <span>Process Details</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[13px]">
            <div className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="w-4 h-4 rounded-full bg-[#22c55e]"></span>
              <span>Ready to Start</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="w-4 h-4 rounded-full bg-[#ef4444]"></span>
              <span>Skipped</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="w-4 h-4 rounded-full bg-[#6b7280]"></span>
              <span>Yet To Start</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="w-4 h-4 rounded-full bg-[#f59e0b]"></span>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-gray-700">
              <span className="w-4 h-4 rounded-full bg-[#3b82f6]"></span>
              <span>Completed</span>
            </div>

            <span className="text-gray-500">|</span>

            <div className="flex items-center gap-2 text-gray-700">
              <button
                type="button"
                onClick={() => setIsFlowchartModalOpen(true)}
                className="hover:text-[#1565c0] transition cursor-pointer p-1 rounded hover:bg-gray-100"
                title="Open Flowchart in Fullscreen View"
              >
                <Expand size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full">
          <ProcessFlowchartContainer
            processes={batchData?.processes || []}
            onOpenProcessDrawer={handleOpenProcessDrawer}
            readOnly={true}
            disableScrollZoom={true}
            containerClassName="h-[600px]"
            mode="batch"
          />
        </div>
      </div>

      {isFlowchartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-2   text-gray-900 text-sm">
                <Workflow size={18} className="text-[#1565c0]" />
                <span>Process Flowchart - {batchData?.batchCode || "Full View"}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFlowchartModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
                title="Close Fullscreen View"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 w-full h-full p-4 bg-slate-50 relative">
              <ProcessFlowchartContainer
                processes={batchData?.processes || []}
                onOpenProcessDrawer={(processId) => {
                  handleOpenProcessDrawer(processId);
                }}
                readOnly={true}
                disableScrollZoom={false}
                containerClassName="h-full"
                mode="batch"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
