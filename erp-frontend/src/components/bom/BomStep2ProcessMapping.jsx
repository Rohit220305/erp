"use client";

import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { PlusCircle, MinusCircle, Star, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { getItem } from "@/lib/api/item-api";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "42px",
    height: "42px",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    borderColor: state.isFocused ? "#1565c0" : "#d1d5db",
    boxShadow: "none",
    fontSize: "13px",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#1565c0",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    height: "42px",
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#1f2937",
    fontSize: "13px",
    fontWeight: "500",
    margin: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
    fontSize: "13px",
    margin: 0,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "13px",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#1565c0"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1f2937",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "220px",
    overflowY: "auto",
  }),
};

export default function BomStep2ProcessMapping({
  formData,
  processItems = [],
  setProcessItems,
  templateProcesses = [],
  rawItemOptions = [],
  processTemplateOptions = [],
  currencySymbol = "$",
  errors = {},
  setErrors,
  setIsDirty,
}) {
  const getItemUomLabel = (itemId) => {
    if (!itemId) return "Unit(s)";
    const found = rawItemOptions.find((i) => Number(i.value) === Number(itemId));
    if (!found) return "Unit(s)";
    return (
      found.itemUomName ||
      found.uomName ||
      found.uomCode ||
      found.itemUomCode ||
      found.uom ||
      "Unit(s)"
    );
  };
  const [groupedProcesses, setGroupedProcesses] = useState([]);
  const [openStates, setOpenStates] = useState({});
  const [itemPrimitiveQtyDisplay, setItemPrimitiveQtyDisplay] = useState("—");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isInternalGroupUpdate = useRef(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    hasInitialized.current = false;
  }, [formData.processTemplateId]);

  useEffect(() => {
    if (formData.itemId) {
      getItem({ id: formData.itemId })
        .then((res) => {
          const itemData = res?.data || res?.settings?.data || res;
          if (itemData) {
            const display =
              itemData.primitiveQuantityDisplay ||
              (itemData.primitiveQuantity
                ? `${itemData.primitiveQuantity} ${itemData.itemUomName || itemData.itemUomCode || "Unit(s)"}`
                : "1.00 Unit(s)");
            setItemPrimitiveQtyDisplay(display);
          }
        })
        .catch(() => setItemPrimitiveQtyDisplay("—"));
    } else {
      setItemPrimitiveQtyDisplay("—");
    }
  }, [formData.itemId]);

  useEffect(() => {
    if (!templateProcesses || templateProcesses.length === 0) {
      setGroupedProcesses([]);
      return;
    }

    if (hasInitialized.current) return;

    const map = templateProcesses.map((tp, idx) => {
      const pMappingId = tp.id || tp.processTemplateMappingId || idx + 1;
      const mappedItems = processItems.filter(
        (pi) => Number(pi.processTemplateMappingId) === Number(pMappingId)
      );

      const entryMaterials = mappedItems.filter((m) => m.materialType !== "Exit");
      const exitMaterials = mappedItems.filter((m) => m.materialType === "Exit");

      return {
        processTemplateMappingId: pMappingId,
        sequenceNo: tp.sequenceNo || idx + 1,
        processName: tp.processName || tp.process?.processName || `Process #${idx + 1}`,
        processCode: tp.processCode || tp.process?.processCode || "",
        workCentreName: tp.workCentreName || tp.workCentre?.workCentreName || "—",
        exitItemName: tp.exitItemName || tp.exitItem?.itemName || tp.item?.itemName || "—",
        exitItemId: tp.exitItemId || tp.itemId || null,
        entryItems: entryMaterials.length > 0
          ? entryMaterials
          : idx === 0
            ? [
                {
                  processTemplateMappingId: pMappingId,
                  materialType: "Entry",
                  itemId: "",
                  quantity: 1,
                  isInternalTransfer: false,
                  isPrimary: "Yes",
                }
              ]
            : [],
        exitItemsList: exitMaterials.length > 0 ? exitMaterials : [],
      };
    });

    isInternalGroupUpdate.current = true;
    hasInitialized.current = true;
    setGroupedProcesses(map);

    const initialOpens = {};
    map.forEach((_, idx) => {
      initialOpens[idx] = true;
    });
    setOpenStates(initialOpens);
  }, [templateProcesses, processItems]);

  const toggleAccordion = (idx) => {
    setOpenStates((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleAll = (open) => {
    const next = {};
    groupedProcesses.forEach((_, idx) => {
      next[idx] = open;
    });
    setOpenStates(next);
  };

  useEffect(() => {
    if (isInternalGroupUpdate.current) {
      isInternalGroupUpdate.current = false;
      return;
    }
    if (groupedProcesses.length > 0) {
      const flat = groupedProcesses.flatMap((gp) => [
        ...gp.entryItems.map((e) => ({ ...e, processTemplateMappingId: gp.processTemplateMappingId, materialType: "Entry" })),
        ...gp.exitItemsList.map((ex) => ({ ...ex, processTemplateMappingId: gp.processTemplateMappingId, materialType: "Exit" })),
      ]);
      setProcessItems(flat);
    }
  }, [groupedProcesses, setProcessItems]);

  const updateEntryMaterial = (pIdx, mIdx, field, value) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      const items = [...proc.entryItems];
      items[mIdx] = { ...items[mIdx], [field]: value };
      proc.entryItems = items;
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const updateExitMaterial = (pIdx, mIdx, field, value) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      const items = [...proc.exitItemsList];
      items[mIdx] = { ...items[mIdx], [field]: value };
      proc.exitItemsList = items;
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const togglePrimaryStar = (pIdx, mIdx) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      const items = proc.entryItems.map((item, i) => ({
        ...item,
        isPrimary: i === mIdx ? (item.isPrimary === "Yes" ? "No" : "Yes") : "No",
      }));
      proc.entryItems = items;
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const addEntryMaterialRow = (pIdx) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      proc.entryItems = [
        ...proc.entryItems,
        {
          processTemplateMappingId: proc.processTemplateMappingId,
          materialType: "Entry",
          itemId: "",
          quantity: 1,
          isInternalTransfer: false,
          isPrimary: "No",
        },
      ];
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const addExitMaterialRow = (pIdx) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      proc.exitItemsList = [
        ...proc.exitItemsList,
        {
          processTemplateMappingId: proc.processTemplateMappingId,
          materialType: "Exit",
          itemId: "",
          quantity: 1,
          isInternalTransfer: false,
          isPrimary: "No",
        },
      ];
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const removeEntryMaterialRow = (pIdx, mIdx) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      proc.entryItems = proc.entryItems.filter((_, i) => i !== mIdx);
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const removeExitMaterialRow = (pIdx, mIdx) => {
    setGroupedProcesses((prev) => {
      const copy = [...prev];
      const proc = { ...copy[pIdx] };
      proc.exitItemsList = proc.exitItemsList.filter((_, i) => i !== mIdx);
      copy[pIdx] = proc;
      return copy;
    });
    if (setIsDirty) setIsDirty(true);
  };

  const confirmRemoveRow = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "entry") {
      removeEntryMaterialRow(deleteTarget.pIdx, deleteTarget.mIdx);
    } else if (deleteTarget.type === "exit") {
      removeExitMaterialRow(deleteTarget.pIdx, deleteTarget.mIdx);
    }
    setDeleteTarget(null);
  };

  const getAvailableEntryOptions = (proc, currentMIdx, isLastProcess) => {
    const usedInEntry = proc.entryItems
      .filter((_, idx) => idx !== currentMIdx)
      .map((item) => Number(item.itemId))
      .filter(Boolean);

    const usedInExit = proc.exitItemsList
      .map((item) => Number(item.itemId))
      .filter(Boolean);

    const fixedExitId = isLastProcess && proc.exitItemId ? Number(proc.exitItemId) : null;

    const excludedIds = new Set([
      ...usedInEntry,
      ...usedInExit,
      ...(fixedExitId ? [fixedExitId] : []),
    ]);

    return rawItemOptions.filter((opt) => !excludedIds.has(Number(opt.value)));
  };

  const getAvailableExitOptions = (proc, currentMIdx, isLastProcess) => {
    const usedInExit = proc.exitItemsList
      .filter((_, idx) => idx !== currentMIdx)
      .map((item) => Number(item.itemId))
      .filter(Boolean);

    const usedInEntry = proc.entryItems
      .map((item) => Number(item.itemId))
      .filter(Boolean);

    const fixedExitId = isLastProcess && proc.exitItemId ? Number(proc.exitItemId) : null;

    const excludedIds = new Set([
      ...usedInExit,
      ...usedInEntry,
      ...(fixedExitId ? [fixedExitId] : []),
    ]);

    return rawItemOptions.filter((opt) => !excludedIds.has(Number(opt.value)));
  };

  const selectedOutputItem = rawItemOptions.find((i) => Number(i.value) === Number(formData.itemId));
  const selectedProcessTemplate = processTemplateOptions.find(
    (p) => Number(p.value) === Number(formData.processTemplateId)
  );
  const processTemplateNameDisplay =
    formData.processTemplateName ||
    selectedProcessTemplate?.label ||
    selectedProcessTemplate?.templateName ||
    "—";
  const isAllOpen = Object.values(openStates).every(Boolean);

  return (
    <div className="space-y-6">
      {/* 1. Bill of Materials Details Summary Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          Bill of Materials Details
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 text-xs">
          <div>
            <span className="text-gray-400 block mb-1">BOM Name</span>
            <span className="font-medium text-gray-900">{formData.bomName || "—"}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Reference Number</span>
            <span className="font-medium text-gray-900">{formData.referenceNumber || "—"}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Item</span>
            <span className="font-medium text-[#1565c0]">
              {selectedOutputItem ? selectedOutputItem.label : "—"}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Primitive Qty</span>
            <span className="font-medium text-gray-900">{itemPrimitiveQtyDisplay}</span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Process Template</span>
            <span className="font-medium text-[#1565c0]">
              {processTemplateNameDisplay}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-1">Status</span>
            <span className="font-semibold text-green-600">
              {formData.status || "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Process List Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-800">Process List</h3>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-medium">
              Note: BOM Configuration is as per {itemPrimitiveQtyDisplay}.
            </span>
            <button
              type="button"
              onClick={() => toggleAll(!isAllOpen)}
              className="text-xs font-semibold text-[#1565c0] hover:text-[#0f57a6] border border-[#1565c0] px-3 py-1 rounded transition cursor-pointer"
            >
              {isAllOpen ? "Close All" : "Open All"}
            </button>
          </div>
        </div>

        {/* 3. Process Cards Accordions */}
        <div className="space-y-4">
          {groupedProcesses.length === 0 ? (
            <div className="p-8 text-center text-gray-400 italic text-xs border border-dashed border-gray-200 rounded-lg">
              No process steps defined in template.
            </div>
          ) : (
            groupedProcesses.map((proc, pIdx) => {
              const isOpen = !!openStates[pIdx];
              const isLastProcess = pIdx === groupedProcesses.length - 1;

              return (
                <div
                  key={proc.processTemplateMappingId || pIdx}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs"
                >
                  {/* Header Banner */}
                  <div
                    onClick={() => toggleAccordion(pIdx)}
                    className={`px-5 py-3 flex items-center justify-between cursor-pointer select-none transition-colors border-b border-gray-200 ${
                      isOpen
                        ? "bg-[#1565c0] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                    }`}
                  >
                    <span className="font-semibold text-xs tracking-wide">
                      {proc.processName.toLowerCase()}                      
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ease-in-out ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="p-5 bg-white grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Box: Entry Material */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-800">
                            Entry Material
                          </span>
                          <button
                            type="button"
                            onClick={() => addEntryMaterialRow(pIdx)}
                            className="text-gray-500 hover:text-[#1565c0] transition cursor-pointer"
                            title="Add Entry Material"
                          >
                            <PlusCircle size={18} />
                          </button>
                        </div>

                        <div className="p-3">
                          {proc.entryItems.length === 0 ? (
                            <div className="py-8 text-center text-xs text-gray-500 font-medium">
                              No Entry Material found.
                            </div>
                          ) : (
                            <table className="w-full text-left text-xs border-separate border-spacing-y-1">
                              <thead>
                                <tr className="bg-[#f8fafc] border-b border-gray-200 text-gray-700 font-semibold">
                                  <th className="py-2.5 px-2 w-8 text-center"></th>
                                  <th className="py-2.5 px-3.5 w-50">
                                    Material Name
                                  </th>
                                  <th className="py-2.5 px-3.5 w-32">
                                    Quantity
                                  </th>
                                  <th className="py-2.5 px-2 w-12 text-center">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {proc.entryItems.map((row, mIdx) => (
                                  <tr key={mIdx}>
                                    <td className="py-3 px-1 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          togglePrimaryStar(pIdx, mIdx)
                                        }
                                        className="cursor-pointer"
                                      >
                                        <Star
                                          size={16}
                                          className={
                                            row.isPrimary === "Yes"
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-gray-300 hover:text-amber-400"
                                          }
                                        />
                                      </button>
                                    </td>
                                    <td className="py-3 px-3">
                                      <Select
                                        instanceId={`select-entry-mat-${pIdx}-${mIdx}`}
                                        value={
                                          rawItemOptions.find(
                                            (i) =>
                                              Number(i.value) ===
                                              Number(row.itemId),
                                          ) || null
                                        }
                                        onChange={(opt) =>
                                          updateEntryMaterial(
                                            pIdx,
                                            mIdx,
                                            "itemId",
                                            opt ? opt.value : "",
                                          )
                                        }
                                        options={getAvailableEntryOptions(
                                          proc,
                                          mIdx,
                                          isLastProcess,
                                        )}
                                        isSearchable={true}
                                        placeholder="Select Item"
                                        styles={selectStyles}
                                        menuPortalTarget={
                                          typeof document !== "undefined"
                                            ? document.body
                                            : null
                                        }
                                        menuPosition="fixed"
                                      />
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="flex items-center rounded-md border border-gray-200 overflow-hidden bg-white h-[42px]">
                                        <input
                                          type="number"
                                          min="0.0001"
                                          step="any"
                                          value={row.quantity || ""}
                                          onChange={(e) =>
                                            updateEntryMaterial(
                                              pIdx,
                                              mIdx,
                                              "quantity",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full h-full px-3 text-xs outline-none bg-white text-gray-800 font-medium"
                                        />
                                        <span className="h-full px-3.5 bg-[#dce4ec] border-l border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center min-w-[60px]">
                                          {getItemUomLabel(row.itemId)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-1 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteTarget({
                                            type: "entry",
                                            pIdx,
                                            mIdx,
                                          })
                                        }
                                        className="text-gray-400 hover:text-red-500 cursor-pointer transition"
                                      >
                                        <MinusCircle size={18} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>

                      {/* Right Box: Exit Material */}
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-800">
                            Exit Material
                          </span>
                          <button
                            type="button"
                            onClick={() => addExitMaterialRow(pIdx)}
                            className="text-gray-500 hover:text-[#1565c0] transition cursor-pointer"
                            title="Add Exit Material"
                          >
                            <PlusCircle size={18} />
                          </button>
                        </div>

                        <div className="p-3 space-y-3">
                          {isLastProcess && (
                            <div className="grid grid-cols-2 gap-4 text-xs py-2 px-3 bg-[#f8fafc] border border-gray-200 rounded-lg">
                              <div>
                                <span className="text-gray-400 block mb-1">
                                  Item Name
                                </span>
                                <span className="font-semibold text-[#1565c0]">
                                  {selectedOutputItem
                                    ? selectedOutputItem.label
                                    : proc.exitItemName}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block mb-1">
                                  Primitive Qty
                                </span>
                                <span className="font-medium text-gray-800">
                                  {itemPrimitiveQtyDisplay}
                                </span>
                              </div>
                            </div>
                          )}

                          {proc.exitItemsList.length === 0 ? (
                            !isLastProcess ? (
                              <div className="py-6 text-center text-xs text-gray-500 font-medium">
                                No Exit Material found.
                              </div>
                            ) : null
                          ) : (
                            <table className="w-full text-left text-xs border-separate border-spacing-y-1">
                              <thead>
                                <tr className="bg-[#f8fafc] border-b border-gray-200 text-gray-700 font-semibold">
                                  <th className="py-2.5 px-3.5 w-44">
                                    Material Name
                                  </th>
                                  <th className="py-2.5 px-3.5 w-32">
                                    Quantity
                                  </th>
                                  <th className="py-2.5 px-2 w-12 text-center">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {proc.exitItemsList.map((row, mIdx) => (
                                  <tr key={mIdx}>
                                    <td className="py-3 px-3">
                                      <Select
                                        instanceId={`select-exit-mat-${pIdx}-${mIdx}`}
                                        value={
                                          rawItemOptions.find(
                                            (i) =>
                                              Number(i.value) ===
                                              Number(row.itemId),
                                          ) || null
                                        }
                                        onChange={(opt) =>
                                          updateExitMaterial(
                                            pIdx,
                                            mIdx,
                                            "itemId",
                                            opt ? opt.value : "",
                                          )
                                        }
                                        options={getAvailableExitOptions(
                                          proc,
                                          mIdx,
                                          isLastProcess,
                                        )}
                                        isSearchable={true}
                                        placeholder="Select Item"
                                        styles={selectStyles}
                                        menuPortalTarget={
                                          typeof document !== "undefined"
                                            ? document.body
                                            : null
                                        }
                                        menuPosition="fixed"
                                      />
                                    </td>
                                    <td className="py-3 px-3">
                                      <div className="flex items-center rounded-md border border-gray-200 overflow-hidden bg-white h-[42px]">
                                        <input
                                          type="number"
                                          min="0.0001"
                                          step="any"
                                          value={row.quantity || ""}
                                          onChange={(e) =>
                                            updateExitMaterial(
                                              pIdx,
                                              mIdx,
                                              "quantity",
                                              e.target.value,
                                            )
                                          }
                                          className="w-full h-full px-3 text-xs outline-none bg-white text-gray-800 font-medium"
                                        />
                                        <span className="h-full px-3.5 bg-[#dce4ec] border-l border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center min-w-[60px]">
                                          {getItemUomLabel(row.itemId)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-1 text-center">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteTarget({
                                            type: "exit",
                                            pIdx,
                                            mIdx,
                                          })
                                        }
                                        className="text-gray-400 hover:text-red-500 cursor-pointer transition"
                                      >
                                        <MinusCircle size={18} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete"
        message="Are you sure want to delete this?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveRow}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
