"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { groupAddSchema, groupEditSchema } from "@/lib/validation/group.schema";
import { saveGroupWithCapabilities, updateGroupWithCapabilities, getCapabilityMatrix } from "@/lib/api/group-api";
import CapabilityMatrix from "./CapabilityMatrix";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const BASE_DEFAULTS = {
  groupCode: "",
  groupName: "",
  description: "",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    borderColor: error ? "#f87171" : "#d1d5db",
    borderRadius: "0.5rem",
    minHeight: "42px",
    backgroundColor: disabled ? "#f9fafb" : "#ffffff",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: error ? "#f87171" : "#9ca3af",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected ? "#1565c0" : state.isFocused ? "#eff6ff" : "#ffffff",
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
  })
});

export default function GroupForm({ mode = "create", defaultValues: initialValues }) {
  const router = useRouter();

  const defaultValues = { ...BASE_DEFAULTS, ...initialValues };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const [capabilities, setCapabilities] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({ ...BASE_DEFAULTS, ...initialValues });
    }
  }, [initialValues]);

  useEffect(() => {
    async function loadMatrix() {
      try {
        setMatrixLoading(true);
        const groupId = mode === "edit" ? initialValues?.id : undefined;
        const res = await getCapabilityMatrix(groupId);
        const data = res?.settings?.data || res?.data || [];
        setCapabilities(data);
        const preselected = data.filter((c) => c.assigned).map((c) => c.capabilityCode);
        setSelectedCodes(preselected);
      } catch (err) {
        toast.error("Failed to load capabilities matrix");
        console.error(err);
      } finally {
        setMatrixLoading(false);
      }
    }
    if (mode === "create" || (mode === "edit" && initialValues?.id)) {
      loadMatrix();
    }
  }, [mode, initialValues?.id]);

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
    const schema = mode === "create" ? groupAddSchema : groupEditSchema;
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

    if (!validateForm()) return;

    if (selectedCodes.length === 0) {
      toast.error("Please select at least one capability");
      return;
    }

    setConfirmState({ isOpen: true, type: "submit", data: formData });
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        capabilityCodes: selectedCodes,
      };

      const response =
        mode === "create"
          ? await saveGroupWithCapabilities(payload)
          : await updateGroupWithCapabilities(payload);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Group created successfully!"
            : "Group updated successfully!"
        );
        router.push("/group");
      } else {
        toast.error(
          message || `Failed to ${mode === "create" ? "create" : "update"} group`
        );
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isDirty || selectedCodes.length > 0) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.back();
    }
  };

  return (
    <div className="h-full mx-6 overflow-y-auto">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-xl p-6 shadow-sm space-y-6 text-black"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Group Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Group Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. SALES_TEAM"
                disabled={mode === "edit"}
                value={formData.groupCode}
                onChange={(e) => handleChange("groupCode", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20
                  ${errors.groupCode ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                  ${mode === "edit" ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}
                `}
              />
              {errors.groupCode && (
                <p className="text-xs text-red-500"> {errors.groupCode}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                value={formData.groupName}
                onChange={(e) => handleChange("groupName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 bg-white
                  ${errors.groupName ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                `}
              />
              {errors.groupName && (
                <p className="text-xs text-red-500"> {errors.groupName}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                placeholder="Enter group description (optional)"
                rows={4}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 resize-none bg-white
                  ${errors.description ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                `}
              />
              {errors.description && (
                <p className="text-xs text-red-500"> {errors.description}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
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
                <p className="text-xs text-red-500"> {errors.status}</p>
              )}
            </div>
          </div>
        </div>

        {matrixLoading ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Loading capability matrix...
          </div>
        ) : (
          <CapabilityMatrix
            capabilities={capabilities}
            selectedCodes={selectedCodes}
            onChange={(codes) => {
              setSelectedCodes(codes);
              setIsDirty(true);
            }}
          />
        )}

        <div className="flex gap-3 justify-center pt-4">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || matrixLoading}
            className="px-6 py-2 bg-[#1565c0] text-white rounded-lg text-sm font-medium hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Group"
                : "Update Group"}
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
            ? "Are you sure you want to save these changes?"
            : "Are you sure you want to discard? Any unsaved changes will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            router.back();
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
