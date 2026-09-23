"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
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
  CirclePlay,
} from "lucide-react";
import { getStatusDisplay } from "@/utils/status-formatter";
import StatusBadge from "@/components/common/StatusBadge";
import {
  getProcessDetails,
  startProcess,
  pauseProcess,
  resumeProcess,
  finishProcess,
} from "@/lib/api/production-batch-api";
import Loader from "@/components/common/Loader";
import ConfirmModal from "@/components/common/ConfirmModal";
import NoDataMessage from "@/components/common/NoDataMessage";
import { displayFormat } from "@/utils/no-data-formatter";
import ProcessLogModal from "./ProcessLogModal";
import { formatNumber, formatQuantityWithUom } from "@/utils/number-formatter";
import NumericInput from "@/components/common/NumericInput";

function CircularProgressGauge({ percentage = 0, label, color = "#22c55e", subText }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
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

export default function ProductionBatchProcessDrawer({ open, onClose, batchId, batchData, processExecutionId, onProcessUpdated }) {
  const [processData, setProcessData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [logModalState, setLogModalState] = useState({
    isOpen: false,
    logType: "",
    items: [],
  });
  const [error, setError] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [activeAccordion, setActiveAccordion] = useState(null);
  const [shouldRender, setShouldRender] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);
  const [finalProcessConfirm, setFinalProcessConfirm] = useState({ isOpen: false, producedQty: 0 });

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

  const handleStartProcess = async () => {
    if (!batchId || !processExecutionId) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      const res = await startProcess({ batchId, processExecutionId });
      if (res?.settings?.success === 1) {
        toast.success(
          `${processData?.processName } process started successfully.`,
        );
        await fetchProcessDetails();
        onProcessUpdated?.();
      } else {
        setActionError(res?.settings?.message || "Failed to start process");
      }
    } catch (err) {
      setActionError("Error starting process");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePauseProcess = async () => {
    if (!batchId || !processExecutionId) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      const res = await pauseProcess({ batchId, processExecutionId });
      if (res?.settings?.success === 1) {
        toast.success(
          `${processData?.processName } process paused successfully.`,
        );
        await fetchProcessDetails();
        onProcessUpdated?.();
      } else {
        setActionError(res?.settings?.message || "Failed to pause process");
      }
    } catch (err) {
      setActionError("Error pausing process");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResumeProcess = async () => {
    if (!batchId || !processExecutionId) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      const res = await resumeProcess({ batchId, processExecutionId });
      if (res?.settings?.success === 1) {
        toast.success(
          `${processData?.processName } process resumed successfully.`,
        );
        await fetchProcessDetails();
        onProcessUpdated?.();
      } else {
        setActionError(res?.settings?.message || "Failed to resume process");
      }
    } catch (err) {
      setActionError("Error resuming process");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFinishProcess = async (producedQty = undefined) => {
    if (!batchId || !processExecutionId) return;
    setIsActionLoading(true);
    setActionError(null);
    try {
      const payload = { batchId, processExecutionId };
      if (producedQty !== undefined) {
        payload.producedQty = Number(producedQty);
      }
      const res = await finishProcess(payload);
      if (res?.settings?.success === 1) {
        toast.success(
          `${processData?.processName } process finished successfully.`,
        );
        await fetchProcessDetails();
        onProcessUpdated?.();
        if (exitItems.length > 0) {
          setLogModalState({ isOpen: true, logType: "Production", items: exitItems });
        }
      } else {
        setActionError(res?.settings?.message || "Failed to finish process");
      }
    } catch (err) {
      setActionError("Error finishing process");
    } finally {
      setIsActionLoading(false);
    }
  };

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    danger: false,
    action: null,
  });

  const requestStartProcess = () => {
    setConfirmState({
      isOpen: true,
      title: "Start Process",
      message: "Are you sure you want to start this process step?",
      confirmLabel: "Start Process",
      danger: false,
      action: handleStartProcess,
    });
  };

  const requestPauseProcess = () => {
    setConfirmState({
      isOpen: true,
      title: "Pause Process",
      message: "Are you sure you want to pause this process step?",
      confirmLabel: "Pause Process",
      danger: false,
      action: handlePauseProcess,
    });
  };

  const requestResumeProcess = () => {
    setConfirmState({
      isOpen: true,
      title: "Resume Process",
      message: "Are you sure you want to resume this process step?",
      confirmLabel: "Resume Process",
      danger: false,
      action: handleResumeProcess,
    });
  };

  const requestFinishProcess = () => {
    if (isLastProcess) {
      setFinalProcessConfirm({ isOpen: true, producedQty: batchData?.batchQuantity || 0 });
    } else {
      setConfirmState({
        isOpen: true,
        title: "Finish Process",
        message: "Are you sure you want to finish this process step?",
        confirmLabel: "Finish Process",
        danger: true,
        action: () => handleFinishProcess(),
      });
    }
  };

  const handleConfirmAction = async () => {
    const actionToRun = confirmState.action;
    setConfirmState({ isOpen: false, title: "", message: "", confirmLabel: "Confirm", danger: false, action: null });
    if (actionToRun) {
      await actionToRun();
    }
  };

  const handleCancelConfirm = () => {
    setConfirmState({ isOpen: false, title: "", message: "", confirmLabel: "Confirm", danger: false, action: null });
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
  
  const maxSeq = Math.max(...(batchData?.processes?.map(p => p.sequenceNumber) || [0]));
  const isLastProcess = processData?.sequenceNumber === maxSeq;

  const entryItems = (processData?.items || []).filter(
    (item) => item.materialType === "Entry"
  );
  
  const exitItems = (processData?.items || []).filter(
    (item) => item.materialType === "Exit" && Number(item.itemId) !== Number(batchData?.itemId)
  );
  const instructions = processData?.instructions || processData?.attachments || [];

  const totalConsumed = entryItems.reduce((sum, item) => sum + (Number(item.consumedQty) || 0), 0);
  const totalRequiredEntry = entryItems.reduce((sum, item) => sum + (Number(item.requiredQty) || 0), 0);
  const consumedPercent = totalRequiredEntry > 0 ? Math.min(100, Math.round((totalConsumed / totalRequiredEntry) * 100)) : 0;
  const consumedText = `${formatNumber(totalConsumed)} / ${formatNumber(totalRequiredEntry)}`;

  const totalProduced = exitItems.reduce((sum, item) => sum + (Number(item.producedQty) || 0), 0);
  const totalRequiredExit = exitItems.reduce((sum, item) => sum + (Number(item.requiredQty) || 0), 0);
  const producedPercent = totalRequiredExit > 0 ? Math.min(100, Math.round((totalProduced / totalRequiredExit) * 100)) : 0;
  const producedText = `${formatNumber(totalProduced)} / ${formatNumber(totalRequiredExit)}`;

  const hasApplicableActions = true;
  
  const isBatchCompleted =
    batchData?.status === "Completed" ||
    Boolean(batchData?.markCompleted);

  const isBatchCancelled = batchData?.status === "Cancelled";

  const isYetToStart =
    status === "YetToStart" ||
    status === "Yet To Start" ||
    status === "Yet-to-start";

  const showActionSection = !isBatchCompleted && !isBatchCancelled && !isYetToStart;
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

        {isLoading || isActionLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
            <Loader />
            <p className="text-xs font-semibold text-gray-500">
              {isActionLoading
                ? "Updating process status..."
                : "Loading process details..."}
            </p>
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
                    {displayFormat(processData.processName)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">
                    Status
                  </span>
                  <StatusBadge status={processData.status} />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">
                    Start Time
                  </span>
                  <span className="font-medium text-gray-700">
                    {displayFormat(processData.startTime, "DATE")}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-0.5">
                    End Time
                  </span>
                  <span className="font-medium text-gray-700">
                    {displayFormat(processData.endTime, "DATE")}
                  </span>
                </div>
              </div>
            </div>

            {showActionSection && (
              <div className="bg-white ">
                <h3 className="text-[14px] font-semibold bg-gray-100 text-gray-800 tracking-wider p-4">
                  Action
                </h3>
                <div className="p-4 space-y-3.5">
                  {actionError && (
                    <div className="p-2 mb-2 text-xs text-red-600 bg-red-50 rounded border border-red-200">
                      {actionError}
                    </div>
                  )}

                  {(status === "ReadytoStart" ||
                    status === "ReadyToStart" ||
                    status === "Ready to Start") && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={requestStartProcess}
                      className="flex items-center gap-2.5 text-gray-700 hover:text-green-700 font-medium text-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <CirclePlay size={18} className="text-green-500" />
                      <span>Start Process</span>
                    </button>
                  )}

                  {status === "InProgress" && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={requestPauseProcess}
                      className="flex items-center gap-2.5 text-gray-700 hover:text-amber-600 font-medium text-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <PauseCircle size={18} className="text-amber-500" />
                      <span>Pause Process</span>
                    </button>
                  )}

                  {status === "Paused" && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={requestResumeProcess}
                      className="flex items-center gap-2.5 text-gray-700 hover:text-amber-600 font-medium text-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <PlayCircle size={18} className="text-amber-500" />
                      <span>Resume Process</span>
                    </button>
                  )}

                  {entryItems.length > 0 &&
                    (status === "InProgress" ||
                      status === "Paused" ||
                      status === "Completed") && (
                      <button
                        type="button"
                        onClick={() =>
                          setLogModalState({
                            isOpen: true,
                            logType: "Consumption",
                            items: entryItems,
                          })
                        }
                        className="flex items-center gap-2.5 text-gray-700 hover:text-red-600 font-medium text-xs cursor-pointer transition w-full text-left"
                      >
                        <PlusCircle size={18} className="text-red-500" />
                        <span>Add Consumption Log</span>
                      </button>
                    )}

                  {exitItems.length > 0 && status === "Completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        setLogModalState({
                          isOpen: true,
                          logType: "Production",
                          items: exitItems,
                        })
                      }
                      className="flex items-center gap-2.5 text-gray-700 hover:text-green-600 font-medium text-xs cursor-pointer transition w-full text-left"
                    >
                      <PlusCircle size={18} className="text-green-500" />
                      <span>Add Production Log</span>
                    </button>
                  )}

                  {(status === "InProgress" || status === "Paused") && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={requestFinishProcess}
                      className="flex items-center gap-2.5 text-gray-700 hover:text-red-600 font-medium text-xs cursor-pointer transition disabled:opacity-50"
                    >
                      <PauseCircle size={18} className="text-red-500" />
                      <span>Finish Process</span>
                    </button>
                  )}
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
                {exitItems.length > 0 && (
                  <CircularProgressGauge
                    percentage={producedPercent}
                    label="Produced"
                    color="#22c55e"
                    subText={producedText}
                  />
                )}
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
                                      {displayFormat(item.itemName)}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono">
                                      {displayFormat(
                                        item.requiredQtyFormatted ||
                                          `${formatNumber(item.requiredQty)} ${item.uomName || item.itemUomName || ""}`
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono text-[#c01515]">
                                      {displayFormat(
                                        item.consumedQtyFormatted ||
                                          `${formatNumber(item.consumedQty)} ${item.uomName || item.itemUomName || ""}`
                                      )}
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

              {exitItems.length > 0 && (
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
                                    {displayFormat(item.itemName)}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono">
                                    {displayFormat(
                                      item.requestedQtyFormatted ||
                                        item.requiredQtyFormatted ||
                                        `${formatNumber(item.requestedQty || item.requestQty || item.requiredQty)} ${item.uomName || item.itemUomName || ""}`
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-green-600 font-semibold">
                                    {displayFormat(
                                      item.producedQtyFormatted ||
                                        `${formatNumber(item.producedQty)} ${item.uomName || item.itemUomName || ""}`
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <ProcessLogModal
        isOpen={logModalState.isOpen}
        onClose={() =>
          setLogModalState({ isOpen: false, logType: "", items: [] })
        }
        logType={logModalState.logType}
        items={logModalState.items}
        processData={processData}
        batchId={batchId}
        onSuccess={() => {
          fetchProcessDetails();
          onProcessUpdated?.();
        }}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
        danger={confirmState.danger}
      />

      {finalProcessConfirm.isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setFinalProcessConfirm({ isOpen: false, producedQty: 0 })
            }
          />
          <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-in fade-in-0 zoom-in-95 text-center">
            <h3 className="text-[17px] font-medium text-gray-900 mb-1">
              Enter Produced Qty in {batchData?.uomName || batchData?.uom || ""}
              ?
            </h3>
            <p className="text-sm font-normal text-gray-600 mb-5">
              Quantity To Be Produced : {batchData?.batchQuantity || 0}
            </p>

            <NumericInput
              min={0}
              maxDecimals={4}
              value={finalProcessConfirm.producedQty}
              onChange={(val) =>
                setFinalProcessConfirm((prev) => ({
                  ...prev,
                  producedQty: val,
                }))
              }
              className="w-full text-left border border-[#1bbdcc] rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#1bbdcc] mb-6 text-gray-800 text-sm"
            />

            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const qty = finalProcessConfirm.producedQty;
                  setFinalProcessConfirm((prev) => ({
                    ...prev,
                    isOpen: false,
                  }));
                  await handleFinishProcess(qty);
                }}
                className="bg-[#1565c0] hover:bg-[#11529c] text-white font-medium py-1.5 px-5 rounded text-sm transition-colors"
                disabled={isActionLoading}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() =>
                  setFinalProcessConfirm({ isOpen: false, producedQty: 0 })
                }
                className="bg-white border border-[#1565c0] text-[#1565c0] font-medium py-1.5 px-5 rounded text-sm hover:bg-gray-50 transition-colors"
                disabled={isActionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
