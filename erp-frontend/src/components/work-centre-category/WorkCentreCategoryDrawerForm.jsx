"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { createWorkCentreCategory, updateWorkCentreCategory } from "@/lib/api/work-centre-category-api";
import { listCompanies } from "@/lib/api/company-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import workCentreCategoryConfig from "@/config/work-centre-category.config.json";
import { getWorkCentreCategorySchema } from "@/lib/validation/work-centre-category.schema";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const BASE_DEFAULTS = {
  categoryCode: "",
  categoryName: "",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f3f4f6" : "#f9fafb",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#1565c0",
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
    color: disabled ? "#9ca3af" : "#1f2937",
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
  })
});

export default function WorkCentreCategoryDrawerForm({
  mode = "create",
  initialData = null,
  id = null,
  onSuccess = null,
  onClose = null,
}) {
  const { can, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);

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

  useEffect(() => {
    if (user?.isSuperAdmin) {
      const loadOptions = async () => {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const compData =
            compRes?.settings?.data?.list || compRes?.data?.list || [];
          setCompanyOptions(
            compData.map((c) => ({ label: c.companyName, value: c.id }))
          );
        } catch (error) {
          console.error("Failed to load company options", error);
        }
      };
      loadOptions();
    }
  }, [user]);

  const requiredPermission =
    mode === "create"
      ? workCentreCategoryConfig.actions?.createPermission ||
      workCentreCategoryConfig.actions?.header?.[0]?.permission
      : workCentreCategoryConfig.actions?.updatePermission ||
      workCentreCategoryConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleNameChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      
      if (mode === "create" && name === "categoryName") {
        const generatedCode = value.toUpperCase().replace(/\s+/g, "_");
        nextData.categoryCode = generatedCode;
      }
      return nextData;
    });

    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        if (mode === "create" && name === "categoryName" && copy.categoryCode) {
          delete copy.categoryCode;
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
    const schema = getWorkCentreCategorySchema(user?.isSuperAdmin);
    const result = schema.safeParse(formData);

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
          ? await createWorkCentreCategory(payload)
          : await updateWorkCentreCategory(payload);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Work Centre Category created successfully!"
            : "Work Centre Category updated successfully!"
        );
        onSuccess && onSuccess();
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} category`);
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
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Category Name"
              value={formData.categoryName || ""}
              onChange={(e) => handleNameChange("categoryName", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none text-sm placeholder:text-sm placeholder:text-gray-400 transition focus:bg-white focus:border-[#1565c0]
                ${errors.categoryName ? "border-red-500 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.categoryName && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryName}</p>
            )}
          </div>

          {user?.isSuperAdmin && (
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
              <Select
                instanceId="select-company"
                value={
                  companyOptions.find((c) => c.value === formData.companyId) ||
                  null
                }
                onChange={(opt) =>
                  handleChange("companyId", opt ? opt.value : "")
                }
                options={companyOptions}
                isDisabled={mode === "edit"}
                isClearable={true}
                isSearchable={true}
                placeholder="Select Company"
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.companyId, mode === "edit")}
              />
              {errors.companyId && (
                <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
              )}
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={mode === "edit"}
              placeholder="Enter Category Code"
              value={formData.categoryCode || ""}
              onChange={(e) => handleChange("categoryCode", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none text-sm placeholder:text-sm placeholder:text-gray-400 transition focus:bg-white focus:border-[#1565c0]
                ${errors.categoryCode ? "border-red-500 bg-red-50" : "border-gray-300"}
                ${mode === "edit" ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}
              `}
            />
            {errors.categoryCode && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryCode}</p>
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
        actionType={confirmState.type === "submit" ? (mode === "create" ? "create" : "update") : "discard"}
        entityName="Work Centre Category"
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
