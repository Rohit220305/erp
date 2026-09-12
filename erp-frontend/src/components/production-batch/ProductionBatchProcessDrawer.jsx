"use client";

import { useState, useEffect } from "react";
import {
  X,
  PlayCircle,
  PlusCircle,
  MinusCircle,
  PauseCircle,
  CheckCircle2,
  FileText,
  ExternalLink,
  Search,
} from "lucide-react";
import { getStatusDisplay } from "@/utils/status-formatter";
import StatusBadge from "@/components/common/StatusBadge";
import { getProcessDetails } from "@/lib/api/production-batch-api";
import Loader from "@/components/common/Loader";
import ProcessLogModal from "./ProcessLogModal";

function CircularProgressGauge({ percentage = 0, label, color = "#22c55e", subText }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    // Animate from 0 to target percentage shortly after mount
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-gray-100"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute font-bold text-sm text-gray-900">{animatedPercentage}%</span>
      </div>
      <span className="text-xs font-semibold mt-1" style={{ color }}>
        {label}
      </span>
      {subText && (
        <span className="text-[11px] font-medium text-gray-500 mt-0.5">
          {subText}
        </span>
      )}
    </div>
  );
}

export default function ProductionBatchProcessDrawer({ open, onClose, batchId, batchData, processExecutionId }) {
  const [processData, setProcessData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [logModalState, setLogModalState] = useState({
    isOpen: false,
    logType: "",
    items: [],
  });
  const [error, setError] = useState(null);

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchProcessDetails = async () => {
    if (!batchId || !processExecutionId || !open) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProcessDetails(batchId, processExecutionId);
      if (response?.settings?.success === 1) {
        setProcessData(response.settings.data);
      } else {
        setError(response?.settings?.message || "Failed to load process details");
      }
    } catch (err) {
      setError("Error loading process details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchProcessDetails();
    }
  }, [batchId, processExecutionId, open]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimating(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open]);

  if (!shouldRender) return null;

  const toggleAccordion = (sectionName) => {
    setActiveAccordion((prev) => (prev === sectionName ? null : sectionName));
  };

  const status = processData?.status || processData?.processState || "YetToStart";

  const entryItems = (processData?.items || []).filter(
    (item) => item.materialType === "Entry"
  );
  
  // Filter out the final finished item (batchData?.itemId) from exitItems
  const exitItems = (processData?.items || []).filter(
    (item) => item.materialType === "Exit" && Number(item.itemId) !== Number(batchData?.itemId)
  );
  const instructions = processData?.instructions || processData?.attachments || [];

  const totalConsumed = entryItems.reduce((sum, item) => sum + (Number(item.consumedQty) || 0), 0);
  const totalRequiredEntry = entryItems.reduce((sum, item) => sum + (Number(item.requiredQty) || 0), 0);
  const consumedPercent = totalRequiredEntry > 0 ? Math.min(100, Math.round((totalConsumed / totalRequiredEntry) * 100)) : 0;
  const consumedText = `${totalConsumed.toFixed(2)} / ${totalRequiredEntry.toFixed(2)}`;

  const totalProduced = exitItems.reduce((sum, item) => sum + (Number(item.producedQty) || 0), 0);
  const totalRequiredExit = exitItems.reduce((sum, item) => sum + (Number(item.requiredQty) || 0), 0);
  const producedPercent = totalRequiredExit > 0 ? Math.min(100, Math.round((totalProduced / totalRequiredExit) * 100)) : 0;
  const producedText = `${totalProduced.toFixed(2)} / ${totalRequiredExit.toFixed(2)}`;

  const hasApplicableActions = true; // Temporarily show actions for all statuses
  
  console.log("processData in ProductionBatchProcessDrawer:", processData);

  return (
    <div className="fixed top-[74px] bottom-0 left-0 right-0 z-[60] overflow-hidden pointer-events-auto">
      <div
        onClick={handleClose}
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute border-l border-dashed border-gray-300 right-0 top-0 h-full w-full max-w-[540px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-base font-bold text-gray-900">Process Details</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 border-2 border-gray-500 text-gray-500 hover:text-gray-700 hover:border-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-red-500">
            <p>{error}</p>
          </div>
        ) : processData ? (
          <div className="flex-1 overflow-y-auto min-h-0  bg-slate-50 text-gray-800 text-[13px]">
          <div className="bg-white  p-4">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">
                  Process
                </span>
                <span className="font-semibold text-gray-900">
                  {processData.processName || "—"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">
                  Status
                </span>
                <StatusBadge status={status} />
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">
                  Start Time
                </span>
                <span className="font-medium text-gray-700">
                  {processData.startTime || "—"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">
                  End Time
                </span>
                <span className="font-medium text-gray-700">
                  {processData.endTime || "—"}
                </span>
              </div>
            </div>
          </div>

          {hasApplicableActions && (
            <div className="bg-white border-gray-200 py-4 pb-0">
              <h3 className="text-[14px] font-semibold bg-gray-100 text-gray-800 tracking-wider p-4">
                Action
              </h3>
              <div className="p-4 space-y-3">
                {(status === "ReadytoStart" ||
                  status === "ReadyToStart" ||
                  status === "Ready to Start") && (
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex items-center gap-2.5 text-gray-700 hover:text-green-700 cursor-pointer transition"
                  >
                    <PlusCircle size={18} className="text-green-500" />
                    <span className="text-sm">Start Process</span>
                  </button>
                )}

                <div className="space-y-4">
                  {entryItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLogModalState({ isOpen: true, logType: 'Consumption', items: entryItems })}
                      className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium cursor-pointer transition w-full text-left"
                    >
                      <PlusCircle size={18} className="text-red-500" />
                      <span className="text-[13px]">Add Consumption Log</span>
                    </button>
                  )}
                  {exitItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setLogModalState({ isOpen: true, logType: 'Production', items: exitItems })}
                      className="flex items-center gap-2 text-gray-700 hover:text-green-600 font-medium cursor-pointer transition w-full text-left"
                    >
                      <PlusCircle size={18} className="text-green-500" />
                      <span className="text-[13px]">Add Production Log</span>
                    </button>
                  )}

                  {/* <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {status === "Paused" ? (
                      <button
                        type="button"
                        onClick={() => {}}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle size={14} />
                        <span>Resume Process</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {}}
                        className="flex-1 border border-amber-500 text-amber-600 hover:bg-amber-50 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <PauseCircle size={14} />
                        <span>Pause Process</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {}}
                      className="flex-1 bg-[#1565c0] hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Finish Process</span>
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white  border-gray-200 py-4 ">
            <h3 className="text-[14px] font-semibold bg-gray-100 text-gray-800  tracking-wider p-4">
              Batch Process Progress
            </h3>

            <div className="flex items-center justify-around py-4">
              <CircularProgressGauge
                percentage={consumedPercent}
                label="Consumed"
                color="#ef4444"
                subText={consumedText}
              />
              <CircularProgressGauge
                percentage={producedPercent}
                label="Produced"
                color="#22c55e"
                subText={producedText}
              />
            </div>
          </div>

          <div className="space-y-1 bg-white">
            <div className="  ">
              <button
                type="button"
                onClick={() => toggleAccordion("entry")}
                className="w-full flex items-center justify-between p-4 text-[14px] font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition cursor-pointer text-left"
              >
                <span>Entry Items</span>
                {activeAccordion === "entry" ? (
                  <MinusCircle
                    size={18}
                    className="text-gray-700 transition-colors"
                  />
                ) : (
                  <PlusCircle
                    size={18}
                    className="text-gray-700 transition-colors"
                  />
                )}
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  activeAccordion === "entry"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    {entryItems.length > 0 ? (
                      <>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                              <th className="py-2.5 px-3">Item Name</th>
                              <th className="py-2.5 px-3 text-right">
                                Required Qty
                              </th>
                              <th className="py-2.5 px-3 text-right">
                                Consumed Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {entryItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="py-2.5 px-3 font-medium text-gray-800">
                                  {item.itemName}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono">
                                  {item.requiredQty ||
                                    "0 gms"}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-[#c01515]">
                                  {item.consumedQty || "0 gms"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-3">
                        No entry material items for this process step.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className=" overflow-hidden ">
              <button
                type="button"
                onClick={() => toggleAccordion("exit")}
                className="w-full flex items-center justify-between p-4 text-[14px] font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition cursor-pointer text-left"
              >
                <span>Exit Items</span>
                {activeAccordion === "exit" ? (
                  <MinusCircle
                    size={18}
                    className="text-gray-700 transition-colors"
                  />
                ) : (
                  <PlusCircle
                    size={18}
                    className="text-gray-700 transition-colors"
                  />
                )}
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  activeAccordion === "exit"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    {exitItems.length > 0 ? (
                      <>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                              <th className="py-2.5 px-3">Item Name</th>
                              <th className="py-2.5 px-3 text-right">
                                Required Qty
                              </th>
                              <th className="py-2.5 px-3 text-right">
                                Produced Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {exitItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="py-2.5 px-3 font-medium text-gray-800">
                                  {item.itemName}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono">
                                  {item.requestedQty ||
                                    item.requestQty ||
                                    item.requiredQty ||
                                    "0 gms"}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-green-600 font-semibold">
                                  {item.producedQty || "0 gms"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-3">
                        No exit material items for this process step.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        ) : null}
      </div>

      <ProcessLogModal
        isOpen={logModalState.isOpen}
        onClose={() => setLogModalState({ isOpen: false, logType: "", items: [] })}
        logType={logModalState.logType}
        items={logModalState.items}
        processData={processData}
        batchId={batchId}
        onSuccess={fetchProcessDetails}
      />
    </div>
  );
}
