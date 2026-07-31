"use client";

import { X, Plus, Minus } from "lucide-react";
import { useEffect } from "react";

export default function SearchDrawer({
  open,
  onClose,
  onSearch,
  onReset,
  filters = [],
  setFilters,
  logicalOperator = "AND",
  setLogicalOperator,
  fields = [],
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null; 

  const addRow = () => {
    if (fields.length === 0) return;
    const defaultField = fields[0];
    const defaultVal = defaultField.type === "select" ? (defaultField.options[0]?.value || "") : "";
    setFilters((prev) => [
      ...prev,
      { field: defaultField.value, operator: "equal", value: defaultVal },
    ]);
  };

  const removeRow = (idx) => {
    setFilters((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRow = (idx, key, value) => {
    setFilters((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        
        if (key === "field") {
          const targetDef = fields.find((f) => f.value === value);
          const newVal = targetDef?.type === "select" ? (targetDef.options[0]?.value || "") : "";
          return { ...row, field: value, value: newVal };
        }
        
        return { ...row, [key]: value };
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
      />

      <div className="relative z-10 w-full max-w-[700px]  rounded-lg bg-white shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-normal text-gray-800">Search...</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center cursor-pointer justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch?.();
          }}
          className="flex flex-col"
        >
          <div className="h-[300px] overflow-y-auto px-6 py-5">
            <div className="mb-4 flex items-center gap-2">
              <select
                value={logicalOperator}
                onChange={(e) => setLogicalOperator?.(e.target.value)}
                className="rounded border  cursor-pointer  border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#1565c0]"
              >
                <option value="AND">All</option>
                <option value="OR">Any</option>
              </select>

              <button
                type="button"
                onClick={addRow}
                className="flex h-8 w-8  cursor-pointer items-center justify-center rounded bg-[#1565c0] text-white hover:bg-[#0f57a6] transition"
              >
                <Plus size={16} />
              </button>
            </div>

            {filters.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No search criteria added. Click "+" to add filters.
              </p>
            ) : (
              filters.map((row, idx) => {
                const currentFieldDef = fields.find(
                  (f) => f.value === row.field,
                );

                return (
                  <div key={idx} className="mb-3 flex items-center gap-3">
                    <select
                      value={row.field}
                      onChange={(e) => updateRow(idx, "field", e.target.value)}
                      className="w-1/3  cursor-pointer rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1565c0]"
                    >
                      {fields.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={row.operator}
                      onChange={(e) =>
                        updateRow(idx, "operator", e.target.value)
                      }
                      className="w-1/4 cursor-pointer  rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1565c0]"
                    >
                      <option value="equal">equal</option>
                      <option value="like">match with</option>  
                      <option value="not equal">not equal</option>
                      <option value="greater than">greater than</option>
                      <option value="less than">less than</option>
                      <option value="greater than equal">
                        greater than equal
                      </option>
                      <option value="less than equal">less than equal</option>
                    </select>

                    <div className="flex-1">
                      {currentFieldDef?.type === "select" ? (
                        <select
                          value={row.value}
                          onChange={(e) =>
                            updateRow(idx, "value", e.target.value)
                          }
                          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1565c0]"
                        >
                          {currentFieldDef.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) =>
                            updateRow(idx, "value", e.target.value)
                          }
                          placeholder="Please enter value"
                          className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1565c0] focus:bg-white"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="flex h-8 w-8 items-center cursor-pointer  justify-center rounded bg-[#1565c0] text-white hover:bg-[#0f57a6] transition"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t rounded-b-lg bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onReset}
              className="rounded border cursor-pointer  border-gray-400 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>

            <button
              type="submit"
              className="rounded cursor-pointer  bg-[#1565c0] px-6 py-2 text-sm font-medium text-white hover:bg-[#0f57a6] transition"
            >
              Find
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
