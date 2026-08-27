"use client";

import Select from "react-select";
import { Info } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const EXECUTION_TYPE_OPTIONS = [
  { label: "Flexible", value: "Flexible" },
  { label: "Sequential", value: "Sequential" },
];

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "44px",
    maxHeight: "100px",
    backgroundColor: disabled ? "#f9fafb" : "#ffffff",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#9ca3af",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    maxHeight: "90px",
    overflowY: "auto",
    padding: "2px 6px",
    "&::-webkit-scrollbar": {
      width: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cbd5e1",
      borderRadius: "2px",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: "0.375rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "220px",
    overflowY: "auto",
    padding: "4px",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: "#f1f5f9",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#cbd5e1",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#94a3b8",
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    borderRadius: "0.25rem",
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

export default function ProcessTemplateStep1({
  formData,
  setFormData,
  errors,
  setErrors,
  companyOptions = [],
  user = null,
  mode = "create",
  setIsDirty,
}) {
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (setIsDirty) setIsDirty(true);

    if (errors && errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleNameChange = (value) => {
    setFormData((prev) => {
      const nextData = { ...prev, templateName: value };
      if (mode === "create") {
        const generatedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        nextData.templateCode = generatedCode;
      }
      return nextData;
    });
    if (setIsDirty) setIsDirty(true);

    if (errors && (errors.templateName || errors.templateCode)) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy.templateName;
        if (mode === "create") delete copy.templateCode;
        return copy;
      });
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-xl border border-gray-100 p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Template Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Template Name"
            value={formData.templateName || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full h-[48px] rounded-md border bg-white px-4 text-sm outline-none transition focus:border-[#1565c0]
              ${errors?.templateName ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
          />
          {errors?.templateName && (
            <p className="mt-1.5 text-sm text-red-500">{errors.templateName}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Template Code<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Template Code"
            disabled={mode === "edit"}
            value={formData.templateCode || ""}
            onChange={(e) => handleChange("templateCode", e.target.value)}
            className={`w-full h-[48px] rounded-md border bg-white px-4 text-sm outline-none transition focus:border-[#1565c0]
              ${errors?.templateCode ? "border-red-500 bg-red-50" : "border-gray-300"}
              ${mode === "edit" ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}
            `}
          />
          {errors?.templateCode && (
            <p className="mt-1.5 text-sm text-red-500">{errors.templateCode}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Process Execution Type<span className="text-red-500">*</span>
          </label>
          <Select
            instanceId="select-execution-type"
            value={EXECUTION_TYPE_OPTIONS.find((e) => e.value === formData.executionType) || null}
            onChange={(opt) => handleChange("executionType", opt ? opt.value : "")}
            options={EXECUTION_TYPE_OPTIONS}
            isClearable={true}
            isSearchable={false}
            placeholder="Select Process Execution Type"
            classNamePrefix="react-select"
            styles={customSelectStyles(errors?.executionType)}
          />
          {errors?.executionType && (
            <p className="mt-1.5 text-sm text-red-500">{errors.executionType}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status<span className="text-red-500">*</span>
          </label>
          <Select
            instanceId="select-status"
            value={STATUS_OPTIONS.find((s) => s.value === formData.status) || null}
            onChange={(opt) => handleChange("status", opt ? opt.value : "")}
            options={STATUS_OPTIONS}
            isClearable={true}
            isSearchable={false}
            placeholder="Select Status"
            classNamePrefix="react-select"
            styles={customSelectStyles(errors?.status)}
          />
          {errors?.status && (
            <p className="mt-1.5 text-sm text-red-500">{errors.status}</p>
          )}
        </div>

        {user?.isSuperAdmin && (
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company<span className="text-red-500">*</span>
            </label>
            <Select
              instanceId="select-company"
              value={
                companyOptions.find(
                  (c) => Number(c.value) === Number(formData.companyId)
                ) || null
              }
              onChange={(opt) => handleChange("companyId", opt ? opt.value : "")}
              options={companyOptions}
              isDisabled={mode === "edit"}
              isClearable={true}
              isSearchable={true}
              placeholder="Select Company"
              classNamePrefix="react-select"
              styles={customSelectStyles(errors?.companyId, mode === "edit")}
            />
            {errors?.companyId && (
              <p className="mt-1.5 text-sm text-red-500">{errors.companyId}</p>
            )}
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <div className="relative">
            <textarea
              rows={4}
              placeholder="Enter Remarks"
              value={formData.remark || ""}
              onChange={(e) => handleChange("remark", e.target.value)}
              className={`w-full rounded-md border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1565c0] pr-10
                ${errors?.remark ? "border-red-500 bg-red-50" : "border-gray-300"}
              `}
            />
            <div className="absolute top-3 right-3 text-gray-400 pointer-events-none">
              <Info size={16} />
            </div>
          </div>
          {errors?.remark && (
            <p className="mt-1.5 text-sm text-red-500">{errors.remark}</p>
          )}
        </div>
      </div>
    </div>
  );
}
