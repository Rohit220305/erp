import React, { useState, useEffect } from "react";
import { X, Info, ChevronDown } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { addProcessLog } from "@/lib/api/production-batch-api";
import { toast } from "react-hot-toast";
import { formatNumber } from "@/utils/number-formatter";
import NumericInput from "@/components/common/NumericInput";

function MaterialThumbnail({ itemName, imageUrl }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={itemName}
        className="max-h-24 max-w-full object-contain rounded"
      />
    );
  }

  const initials = (itemName || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
      <span className="text-xl font-bold text-gray-400">{initials}</span>
    </div>
  );
}

export default function ProcessLogModal({
  isOpen,
  onClose,
  logType,
  processData,
  items = [],
  batchId,
  onSuccess,
}) {
  const [logDate, setLogDate] = useState("");
  const [logItems, setLogItems] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
  });

  useEffect(() => {
    if (isOpen) {
      setLogDate(new Date().toISOString().split("T")[0]);

      const initialItems = {};
      items.forEach((item) => {
        const reqQty = Number(item.requiredQty || item.requestedQty || item.requestQty || 0);
        const consQty = Number(item.consumedQty || 0);
        const prodQty = Number(item.producedQty || 0);
        const unit = item.unitName || item.unit || item.uom || item.uomName || item.itemUomName || "";

        initialItems[item.itemId] = {
          itemId: item.itemId,
          itemName: item.itemName,
          unit: unit,
          requiredQty: reqQty,
          consumedQty: consQty,
          producedQty: prodQty,
          imageUrl: item.imageUrl || null,
          loggedQty: "",
          useAll: false,
        };
      });
      setLogItems(initialItems);
      setConfirmState({ isOpen: false, type: null });
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const handleQtyChange = (itemId, value) => {
    setLogItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;

      if (logType === "Consumption") {
        const targetQty = Math.max(0, item.requiredQty - item.consumedQty);
        let val = Number(value);
        if (val > targetQty) {
          val = targetQty;
        }
        const isFull = val > 0 && Math.abs(val - targetQty) < 0.0001;
        return {
          ...prev,
          [itemId]: {
            ...item,
            loggedQty: val === 0 && value === "" ? "" : val,
            useAll: isFull,
          },
        };
      } else {
        const val = value === "" ? "" : Math.max(0, Number(value));
        const reqRemaining = Math.max(0, item.requiredQty - item.producedQty);
        const isFull = Number(val) > 0 && Math.abs(Number(val) - reqRemaining) < 0.0001;
        return {
          ...prev,
          [itemId]: {
            ...item,
            loggedQty: val,
            useAll: isFull,
          },
        };
      }
    });
  };

  const handleToggleUseAll = (itemId) => {
    setLogItems((prev) => {
      const item = prev[itemId];
      if (!item) return prev;

      const newUseAll = !item.useAll;
      let newQty = "";

      if (newUseAll) {
        const remaining = logType === "Consumption"
          ? Math.max(0, item.requiredQty - item.consumedQty)
          : Math.max(0, item.requiredQty - item.producedQty);
        newQty = remaining;
      }

      return {
        ...prev,
        [itemId]: {
          ...item,
          loggedQty: newQty,
          useAll: newUseAll,
        },
      };
    });
  };

  const handleDiscardRequest = () => {
    setConfirmState({ isOpen: true, type: "discard" });
  };

  const handleSubmitRequest = () => {
    if (!logDate) {
      toast.error("Please select a log date.");
      return;
    }

    const hasValue = Object.values(logItems).some(
      (item) => Number(item.loggedQty) > 0
    );

    if (!hasValue) {
      toast.error("Please enter a quantity greater than 0 for at least one item.");
      return;
    }

    setConfirmState({ isOpen: true, type: "submit" });
  };

  const handleConfirmAction = async () => {
    const currentType = confirmState.type;
    setConfirmState({ isOpen: false, type: null });

    if (currentType === "discard") {
      onClose();
    } else if (currentType === "submit") {
      await executeSubmit();
    }
  };

  const handleCancelConfirm = () => {
    setConfirmState({ isOpen: false, type: null });
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedItems = Object.values(logItems)
        .filter((item) => Number(item.loggedQty) > 0)
        .map((item) => ({
          itemId: item.itemId,
          loggedQty: Number(item.loggedQty),
        }));

      const payload = {
        productionBatchId: Number(batchId),
        productionBatchProcessId: Number(processData?.id || processData?.processExecutionId),
        logType,
        logDate,
        items: formattedItems,
      };

      const res = await addProcessLog(payload);
      if (res && (res.success === 1 || res.success === true)) {
        toast.success(`${logType} log added successfully!`);
        onSuccess?.();
        onClose();
      } else {
        toast.error(res?.message || "Failed to add log");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred while logging.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const processName = (
    processData?.processMasterName ||
    processData?.processName ||
    processData?.name ||
    "melting"
  ).toLowerCase();

  const title = logType === "Consumption" ? "Consumption Log" : "Production Log";

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-gray-100">
          <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Process</span>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    readOnly
                    value={processName}
                    className="w-32 px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-700 bg-gray-50/80 font-medium lowercase outline-none"
                  />
                  <ChevronDown size={14} className="absolute right-2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-36 px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-700 bg-white font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                  <span className="text-sm font-semibold text-gray-600">Item Name</span>
                  <span className="text-sm font-semibold text-gray-600">Qty</span>
                </div>

                <div className="space-y-5">
                  {Object.values(logItems).map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-gray-800">
                          {item.itemName}
                        </span>
                        <div className="flex flex-col mt-0.5 space-y-0.5">
                          <span className="text-xs text-gray-500 font-medium">
                            {logType === "Consumption" ? "Consumed: " : "Produced: "}
                            <span className="text-gray-900 font-semibold">
                              {logType === "Consumption" ? formatNumber(item.consumedQty) : formatNumber(item.producedQty)} / {formatNumber(item.requiredQty)} {item.unit}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="relative w-36 sm:w-40 shrink-0">
                        <NumericInput
                          min={0}
                          maxDecimals={4}
                          step="0.0001"
                          placeholder=""
                          value={item.loggedQty}
                          disabled={logType === "Consumption" && Math.max(0, item.requiredQty - item.consumedQty) <= 0}
                          onChange={(val) => handleQtyChange(item.itemId, val)}
                          className="w-full rounded border border-gray-200 bg-gray-100/60 py-2 pl-3 pr-11 text-sm text-gray-800 text-left font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-gray-500 font-medium">
                          {item.unit}
                        </span>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                      No items available for this log type.
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-7 border-l border-gray-100 lg:pl-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(logItems).map((item) => {
                    const ratioText = logType === "Consumption"
                      ? `${formatNumber(item.consumedQty)} Unit(s) / ${formatNumber(item.requiredQty)} ${item.unit}`
                      : `${formatNumber(item.producedQty)} Unit(s) / ${formatNumber(item.requiredQty)} ${item.unit}`;

                    return (
                      <div
                        key={item.itemId}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between relative group"
                      >
                        <div className="max-h-28 max-w-full flex items-center justify-center mb-3 ">
                          <MaterialThumbnail
                            itemName={item.itemName}
                            imageUrl={item.imageUrl}
                          />
                        </div>

                        <div className="text-left mt-1">
                          <h4 className="text-sm font-bold text-gray-800 truncate">
                            {item.itemName}
                          </h4>
                          <div className="flex flex-col mt-0.5 space-y-0.5">
                            <span className="text-[11px] text-gray-500 font-medium">
                              {logType === "Consumption" ? "Consumed: " : "Produced: "}
                              <span className="text-gray-900 font-semibold">
                                {logType === "Consumption" ? formatNumber(item.consumedQty) : formatNumber(item.producedQty)} / {formatNumber(item.requiredQty)} {item.unit}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <span className="text-xs font-semibold text-gray-500">
                            Use All
                          </span>
                          <button
                            type="button"
                            disabled={logType === "Consumption" ? Math.max(0, item.requiredQty - item.consumedQty) <= 0 : Math.max(0, item.requiredQty - item.producedQty) <= 0}
                            onClick={() => handleToggleUseAll(item.itemId)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                              item.useAll ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                item.useAll ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-center gap-4 pt-8 pb-2">
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={isSubmitting || items.length === 0}
                className="px-8 py-2 bg-[#1967d2] hover:bg-[#1557b0] active:bg-[#114999] text-white text-sm font-bold rounded-md shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleDiscardRequest}
                disabled={isSubmitting}
                className="px-8 py-2 bg-[#1967d2] hover:bg-[#1557b0] active:bg-[#114999] text-white text-sm font-bold rounded-md shadow-sm transition cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === "submit"
            ? `Confirm ${logType} Log Submission`
            : `Discard ${logType} Log Changes?`
        }
        message={
          confirmState.type === "submit"
            ? `Are you sure you want to submit this ${logType.toLowerCase()} log? This action is immutable and will update running totals.`
            : `Are you sure you want to discard your changes? Any entered log quantities will be lost.`
        }
        confirmLabel={confirmState.type === "submit" ? "Submit Log" : "Discard"}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
        danger={confirmState.type === "discard"}
      />
    </>
  );
}
