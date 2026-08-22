"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { listProcesses } from "@/lib/api/process-api";
import { ArrowUp, ArrowDown, Trash2, Plus, Info } from "lucide-react";

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f9fafb" : "#ffffff",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#9ca3af",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#1565c0"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1f2937",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#eff6ff",
    borderRadius: "0.25rem",
    border: "1px solid #bfdbfe",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1d4ed8",
    fontSize: "0.75rem",
    fontWeight: "500",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#1d4ed8",
    "&:hover": {
      backgroundColor: "#dbeafe",
      color: "#1e40af",
    },
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: disabled ? "#9ca3af" : "#1f2937",
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#9ca3af",
  }),
  clearIndicator: (base) => ({
    ...base,
    cursor: "pointer",
    pointerEvents: "auto",
    padding: "8px",
    color: "#9ca3af",
    "&:hover": {
      color: "#ef4444",
    },
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    cursor: "pointer",
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  }),
});

export default function ProcessTemplateStep2({
  formData = {},
  processes = [],
  setProcesses,
  companyId = null,
  errors = {},
  setErrors,
  setIsDirty,
}) {
  const [availableProcesses, setAvailableProcesses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load process master list based on companyId
  useEffect(() => {
    let isMounted = true;
    async function loadMasterProcesses() {
      if (!companyId && companyId !== 0) {
        setAvailableProcesses([]);
        return;
      }
      try {
        setLoading(true);
        const res = await listProcesses({
          page: 1,
          limit: 1000,
          filters: [{ key: "companyId", value: companyId, operator: "equal" }],
        });
        if (!isMounted) return;

        const list = res?.settings?.data?.list || res?.data?.list || res?.data || [];
        setAvailableProcesses(list);
      } catch (err) {
        console.error("Failed to load process list for step 2", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMasterProcesses();
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  // Recalculate contiguous sequence numbers (1, 2, 3...)
  const updateSequenceNumbers = (list) => {
    return list.map((item, idx) => ({
      ...item,
      sequenceNo: idx + 1,
      dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
    }));
  };

  // Add new process row
  const handleAddRow = () => {
    const newRow = {
      processId: "",
      processName: "",
      processCode: "",
      sequenceNo: processes.length + 1,
      dependencies: [],
    };
    const updated = [...processes, newRow];
    setProcesses(updated);
    if (setIsDirty) setIsDirty(true);
    if (errors?.processes) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.processes;
        return copy;
      });
    }
  };

  // Select Process in Row `index`
  const handleProcessSelect = (index, selectedOption) => {
    const oldProcessId = processes[index]?.processId;
    const newProcessId = selectedOption ? Number(selectedOption.value) : "";
    const procItem = availableProcesses.find((p) => Number(p.id) === newProcessId);

    const updated = processes.map((row, idx) => {
      const currentDeps = Array.isArray(row.dependencies) ? row.dependencies : [];
      if (idx === index) {
        return {
          ...row,
          processId: newProcessId,
          processName: procItem ? procItem.processName : "",
          processCode: procItem ? procItem.processCode : "",
          dependencies: [],
        };
      }
      // Clean up old processId from downstream dependencies
      if (oldProcessId && currentDeps.includes(oldProcessId)) {
        return {
          ...row,
          dependencies: currentDeps.filter((id) => id !== oldProcessId),
        };
      }
      return { ...row, dependencies: currentDeps };
    });

    setProcesses(updated);
    if (setIsDirty) setIsDirty(true);
  };

  // Update dependencies for Row `index`
  const handleDependenciesSelect = (index, selectedOptions) => {
    const depIds = selectedOptions ? selectedOptions.map((opt) => Number(opt.value)) : [];
    const updated = processes.map((row, idx) => {
      if (idx === index) {
        return { ...row, dependencies: depIds };
      }
      return { ...row, dependencies: Array.isArray(row.dependencies) ? row.dependencies : [] };
    });
    setProcesses(updated);
    if (setIsDirty) setIsDirty(true);
  };

  // Move Row Up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const list = [...processes];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;

    const resequenced = updateSequenceNumbers(list);

    const cleaned = resequenced.map((row, idx) => {
      const allowedPrecedingIds = new Set(
        resequenced.slice(0, idx).map((r) => r.processId).filter(Boolean)
      );
      const rowDeps = Array.isArray(row.dependencies) ? row.dependencies : [];
      const validDeps = rowDeps.filter((depId) => allowedPrecedingIds.has(depId));
      return { ...row, dependencies: validDeps };
    });

    setProcesses(cleaned);
    if (setIsDirty) setIsDirty(true);
  };

  // Move Row Down
  const handleMoveDown = (index) => {
    if (index === processes.length - 1) return;
    const list = [...processes];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;

    const resequenced = updateSequenceNumbers(list);

    const cleaned = resequenced.map((row, idx) => {
      const allowedPrecedingIds = new Set(
        resequenced.slice(0, idx).map((r) => r.processId).filter(Boolean)
      );
      const rowDeps = Array.isArray(row.dependencies) ? row.dependencies : [];
      const validDeps = rowDeps.filter((depId) => allowedPrecedingIds.has(depId));
      return { ...row, dependencies: validDeps };
    });

    setProcesses(cleaned);
    if (setIsDirty) setIsDirty(true);
  };

  // Delete Row
  const handleDeleteRow = (index) => {
    const deletedId = processes[index]?.processId;
    const filtered = processes.filter((_, idx) => idx !== index);
    const resequenced = updateSequenceNumbers(filtered);

    const cleaned = resequenced.map((row) => {
      const rowDeps = Array.isArray(row.dependencies) ? row.dependencies : [];
      if (deletedId && rowDeps.includes(deletedId)) {
        return {
          ...row,
          dependencies: rowDeps.filter((id) => id !== deletedId),
        };
      }
      return { ...row, dependencies: rowDeps };
    });

    setProcesses(cleaned);
    if (setIsDirty) setIsDirty(true);
  };

  const selectedProcessIds = processes.map((p) => Number(p.processId)).filter(Boolean);
  const isStatusActive = formData.status === "Active" || formData.status === "active";

  return (
    <div className="space-y-6 ">
      {/* Top Details Summary Card */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="block text-gray-500 text-xs mb-1">Template Name</span>
            <span className="font-semibold text-gray-800">{formData.templateName || "-"}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-1">Template Code</span>
            <span className="font-semibold text-gray-800">{formData.templateCode || "-"}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-1">Remark</span>
            <span className="font-medium text-gray-700">{formData.remark || "-"}</span>
          </div>
          <div>
            <span className="block text-gray-500 text-xs mb-1">Status</span>
            <span className={`font-semibold ${isStatusActive ? "text-green-600" : "text-red-600"}`}>
              {formData.status || "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Process Details Card */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
          <h3 className="text-base font-semibold text-gray-800">Process Details</h3>
          <button
            type="button"
            onClick={handleAddRow}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#1565c0] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0f57a6] transition cursor-pointer disabled:opacity-50"
          >
            <Plus size={16} />
            Add Process
          </button>
        </div>

        {errors?.processes && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
            <Info size={18} className="text-red-500 shrink-0" />
            <span>{errors.processes}</span>
          </div>
        )}

        {/* Process Sequence Table */}
        <div className="rounded-md border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                <th className="py-3 px-4 min-w-[280px]">Process Name*</th>
                <th className="py-3 px-4 min-w-[320px]">Dependency</th>
                <th className="py-3 px-4 w-28 text-center">Move</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {processes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <p className="text-base font-medium text-gray-600">No processes added</p>
                      <p className="text-xs text-gray-400">
                        Click &quot;+ Add Process&quot; above to start adding sequence rows.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                processes.map((row, idx) => {
                  const rowDeps = Array.isArray(row.dependencies) ? row.dependencies : [];

                  // Options for Process dropdown
                  const processSelectOptions = availableProcesses
                    .filter(
                      (p) =>
                        !selectedProcessIds.includes(Number(p.id)) ||
                        Number(p.id) === Number(row.processId)
                    )
                    .map((p) => ({
                      label: p.processName,
                      value: p.id,
                    }));

                  // Options for Dependency dropdown (strictly preceding rows)
                  const dependencyOptions = processes
                    .slice(0, idx)
                    .filter((r) => r.processId && r.processName)
                    .map((r) => ({
                      label: r.processName,
                      value: r.processId,
                    }));

                  const selectedProcessValue = processSelectOptions.find(
                    (opt) => Number(opt.value) === Number(row.processId)
                  ) || (row.processId ? { label: row.processName, value: row.processId } : null);

                  const selectedDepValues = dependencyOptions.filter((opt) =>
                    rowDeps.includes(Number(opt.value))
                  );

                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      {/* Process Name Select */}
                      <td className="py-3 px-4">
                        <Select
                          instanceId={`select-process-${idx}`}
                          value={selectedProcessValue}
                          onChange={(opt) => handleProcessSelect(idx, opt)}
                          options={processSelectOptions}
                          isClearable={true}
                          isSearchable={true}
                          placeholder="Select Process"
                          classNamePrefix="react-select"
                          styles={customSelectStyles()}
                          noOptionsMessage={() =>
                            availableProcesses.length === 0
                              ? "No processes found for this company"
                              : "All available processes are selected"
                          }
                        />
                      </td>

                      {/* Dependency MultiSelect */}
                      <td className="py-3 px-4">
                        <Select
                          instanceId={`select-deps-${idx}`}
                          isMulti={true}
                          value={selectedDepValues}
                          onChange={(opts) => handleDependenciesSelect(idx, opts)}
                          options={dependencyOptions}
                          isDisabled={idx === 0 || dependencyOptions.length === 0}
                          placeholder="Select Dependencies"
                          classNamePrefix="react-select"
                          styles={customSelectStyles(false, idx === 0 || dependencyOptions.length === 0)}
                        />
                      </td>

                      {/* Move Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              title="Move Up"
                              onClick={() => handleMoveUp(idx)}
                              className="p-1 text-gray-500 hover:text-[#1565c0] cursor-pointer transition"
                            >
                              <ArrowUp size={16} />
                            </button>
                          )}
                          {idx < processes.length - 1 && (
                            <button
                              type="button"
                              title="Move Down"
                              onClick={() => handleMoveDown(idx)}
                              className="p-1 text-gray-500 hover:text-[#1565c0] cursor-pointer transition"
                            >
                              <ArrowDown size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Action Button (Delete) */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          title="Delete Row"
                          onClick={() => handleDeleteRow(idx)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
