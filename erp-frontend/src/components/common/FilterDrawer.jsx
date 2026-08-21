"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import Select from "react-select";

export default function FilterDrawer({
  open,
  onClose,
  onSearch,
  onReset,
  filters,
  setFilters,
  fields,
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between bg-[#1565c0] px-6 py-5">
          <h2 className="text-xl font-semibold text-white">Filters</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 cursor-pointer  text-white transition hover:bg-white/15"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(100%-72px)] flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {fields?.map((field) => {
              if (field.type === "select") {
                return (
                  <SelectField
                    key={field.value}
                    label={field.label}
                    placeholder={`Select ${field.label}`}
                    value={filters[field.value]}
                    onChange={(v) =>
                      setFilters((p) => ({ ...p, [field.value]: v }))
                    }
                    options={field.options || []}
                    isMultiSelect={field.isMultiSelect}
                  />
                );
              }
              return (
                <FilterField
                  key={field.value}
                  label={field.label}
                  placeholder={`Please enter ${field.label}`}
                  value={filters[field.value] || ""}
                  onChange={(v) => setFilters((p) => ({ ...p, [field.value]: v }))}
                />
              );
            })}
          </div>

          <div className="border-t bg-white px-6 pt-5 pb-10">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 cursor-pointer  rounded-md border border-[#1565c0] px-4 py-3 text-[#1565c0] transition hover:bg-blue-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={onSearch}
                className="flex-1 cursor-pointer rounded-md bg-[#1565c0] px-4 py-3 text-white transition hover:bg-[#0f57a6]"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterField({ label, placeholder, value, onChange }) {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-[#1565c0] focus:bg-white"
      />
    </div>
  );
}

function SelectField({ label, placeholder, value, onChange, options, isMultiSelect }) {
  const selectedValue = isMultiSelect
    ? options.filter((opt) => (value || []).includes(opt.value))
    : options.find((opt) => opt.value === value) || null;

  const handleChange = (selected) => {
    if (isMultiSelect) {
      onChange(selected ? selected.map((item) => item.value) : []);
    } else {
      onChange(selected ? selected.value : "");
    }
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      minHeight: "40px",
      backgroundColor: "#ffffff",
      boxShadow: "none",
      cursor: "pointer",
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: "#1565c0",
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
    singleValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#1f2937",
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: "0.875rem",
      color: "#9ca3af",
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      transition: "all .2s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
    }),
  };

  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Select
        isMulti={isMultiSelect}
        value={selectedValue}
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        isClearable={true}
        isSearchable={true}
        styles={customSelectStyles}
        classNamePrefix="react-select"
      />
    </div>
  );
}
