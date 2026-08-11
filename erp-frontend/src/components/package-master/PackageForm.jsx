"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { createPackage, updatePackage } from "@/lib/api/package-master-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import packageMasterConfig from "@/config/package-master.config.json";
import { packageMasterAddUpdateSchema } from "@/lib/validation/package-master.schema";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const BASE_DEFAULTS = {
  packageCode: "",
  packageName: "",
  abbreviation: "",
  description: "",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.5rem",
    minHeight: "42px",
    backgroundColor: disabled ? "#f9fafb" : "#ffffff",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: error ? "#f87171" : "#d1d5db",
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

export default function PackageForm({
  mode = "create",
  initialData = null,
  id = null,
}) {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();
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

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: `${mode === "create" ? "Add" : "Edit"} Package Type`,
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: packageMasterConfig.title, href: "/package-master" },
          {
            label: `${mode === "create" ? "Add" : "Edit"} Package Type`,
          },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, mode]);

  const requiredPermission =
    mode === "create"
      ? packageMasterConfig.actions?.createPermission ||
      packageMasterConfig.actions?.header?.[0]?.permission
      : packageMasterConfig.actions?.updatePermission ||
      packageMasterConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleNameChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      
      if (mode === "create" && name === "packageName") {
        const generatedCode = value.toUpperCase().replace(/\s+/g, "_");
        nextData.packageCode = generatedCode;
      }
      return nextData;
    });

    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        if (mode === "create" && name === "packageName" && copy.packageCode) {
          delete copy.packageCode;
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
    const result = packageMasterAddUpdateSchema.safeParse(formData);

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
      router.push("/package-master");
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = mode === "edit" ? { ...data, id: Number(id) } : data;

      const response =
        mode === "create"
          ? await createPackage(payload)
          : await updatePackage(payload);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Package Type created successfully!"
            : "Package Type updated successfully!"
        );
        router.push("/package-master");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} package type`);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 h-full overflow-y-auto pb-20 mx-6">
      <form onSubmit={handleFormSubmit} className="space-y-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
              Basic Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Package Type Name <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.packageName || ""}
                onChange={(e) => handleNameChange("packageName", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.packageName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  `}
              />
              {errors.packageName && (
                <p className="text-xs text-red-500">{errors.packageName}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Package Type Code <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                disabled={mode === "edit"}
                value={formData.packageCode || ""}
                onChange={(e) => handleChange("packageCode", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                        ${errors.packageCode ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                        ${mode === "edit" ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white"}
                      `}
              />
              {errors.packageCode && (
                <p className="text-xs text-red-500">{errors.packageCode}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Abbreviation
              </label>
              <input
                type="text"
                value={formData.abbreviation || ""}
                onChange={(e) => handleChange("abbreviation", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.abbreviation ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  `}
              />
              {errors.abbreviation && (
                <p className="text-xs text-red-500">{errors.abbreviation}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Status
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
                <p className="text-xs text-red-500">{errors.status}</p>
              )}
            </div>
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.description ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  `}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading
              ? "Saving..."
              : "Submit"}
          </button>
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
            ? "Are you sure you want to save this package type?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            router.push("/package-master");
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
