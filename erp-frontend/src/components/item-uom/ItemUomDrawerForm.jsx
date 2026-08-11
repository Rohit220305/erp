"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { createItemUom, updateItemUom } from "@/lib/api/item-uom-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import itemUomConfig from "@/config/item-uom.config.json";
import { itemUomSchema } from "@/lib/validation/item-uom.schema";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const UNIT_TYPE_OPTIONS = [
  { label: "Length", value: "length" },
  { label: "Temperature", value: "temperature" },
  { label: "Density", value: "density" },
  { label: "Volume", value: "volume" },
  { label: "Weight", value: "weight" },
  { label: "Time", value: "time" },
  { label: "Pumping Rate", value: "pumping_rate" }
];

const BASE_DEFAULTS = {
  uomName: "",
  itemUomCode: "",
  isoCode: "",
  abbreviation: "",
  unitType: "",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f9fafb" : "#f9fafb",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: error ? "#f87171" : "#1565c0",
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
});

export default function ItemUomDrawerForm({
  mode = "create",
  initialData = null,
  id = null,
  onSuccess = null,
  onClose = null,
}) {
  const { can } = useAuth();
  const [loading, setLoading] = useState(false);

  const defaultValues = { ...BASE_DEFAULTS, ...initialData };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
    }
  }, [initialData]);

  const requiredPermission =
    mode === "create"
      ? itemUomConfig.actions?.createPermission ||
      itemUomConfig.actions?.header?.[0]?.permission
      : itemUomConfig.actions?.updatePermission ||
      itemUomConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleNameChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      
      if (mode === "create" && name === "uomName") {
        const generatedCode = value.toUpperCase().replace(/\s+/g, "_");
        nextData.itemUomCode = generatedCode;
      }
      return nextData;
    });

    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        if (mode === "create" && name === "uomName" && copy.itemUomCode) {
          delete copy.itemUomCode;
        }
        return copy;
      });
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const result = itemUomSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmState({ isOpen: true, type: "submit", data: formData });
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      onClose && onClose();
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = mode === "edit" ? { ...data, id: Number(id) } : data;

      const response =
        mode === "create"
          ? await createItemUom(payload)
          : await updateItemUom(payload);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Item UOM created successfully!"
            : "Item UOM updated successfully!"
        );
        onSuccess && onSuccess();
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} Item UOM`);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col text-black">
      <form onSubmit={handleFormSubmit} id="drawer-form" className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              UOM Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.uomName || ""}
              onChange={(e) => handleNameChange("uomName", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none transition focus:bg-white focus:border-[#1565c0]
                ${errors.uomName ? "border-red-500 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.uomName && (
              <p className="mt-1 text-sm text-red-500">{errors.uomName}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              UOM Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={mode === "edit"}
              value={formData.itemUomCode || ""}
              onChange={(e) => handleChange("itemUomCode", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none transition focus:bg-white focus:border-[#1565c0]
                ${errors.itemUomCode ? "border-red-500 bg-red-50" : "border-gray-300"}
                ${mode === "edit" ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}
              `}
            />
            {errors.itemUomCode && (
              <p className="mt-1 text-sm text-red-500">{errors.itemUomCode}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              ISO Code
            </label>
            <input
              type="text"
              value={formData.isoCode || ""}
              onChange={(e) => handleChange("isoCode", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none transition focus:bg-white focus:border-[#1565c0] border-gray-300`}
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Abbreviation
            </label>
            <input
              type="text"
              value={formData.abbreviation || ""}
              onChange={(e) => handleChange("abbreviation", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none transition focus:bg-white focus:border-[#1565c0] border-gray-300`}
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Unit Type <span className="text-red-500">*</span>
            </label>
            <Select
              instanceId="select-unit-type"
              value={
                UNIT_TYPE_OPTIONS.find((s) => s.value === formData.unitType) ||
                null
              }
              onChange={(opt) => handleChange("unitType", opt ? opt.value : "")}
              options={UNIT_TYPE_OPTIONS}
              isClearable={true}
              isSearchable={false}
              placeholder="Select Unit Type"
              classNamePrefix="react-select"
              styles={customSelectStyles(errors.unitType)}
            />
            {errors.unitType && (
              <p className="mt-1 text-sm text-red-500">{errors.unitType}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              instanceId="select-status"
              value={
                STATUS_OPTIONS.find((s) => s.value === formData.status) ||
                null
              }
              onChange={(opt) => handleChange("status", opt ? opt.value : "")}
              options={STATUS_OPTIONS}
              isClearable={true}
              isSearchable={false}
              placeholder="Select Status"
              classNamePrefix="react-select"
              styles={customSelectStyles(errors.status)}
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>
        </div>

        <div className="border-t bg-white px-6 pt-5 pb-10">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md border border-[#1565c0] px-4 py-3 text-[#1565c0] transition hover:bg-blue-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md bg-[#1565c0] px-4 py-3 text-white transition hover:bg-[#0f57a6] disabled:opacity-50"
            >
              {loading ? "Saving..." : mode === "create" ? "Save" : "Update"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === "submit"
            ? "Confirm Submission"
            : "Discard Changes"
        }
        message={
          confirmState.type === "submit"
            ? "Are you sure you want to save this Item UOM?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            onClose && onClose();
          }
          setConfirmState({ isOpen: false, type: null, data: null });
        }}
        onCancel={() =>
          setConfirmState({ isOpen: false, type: null, data: null })
        }
      />
    </div>
  );
}
