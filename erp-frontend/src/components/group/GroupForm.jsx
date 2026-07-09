"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupAddSchema, groupEditSchema } from "@/lib/validation/group.schema";
import { saveGroupWithCapabilities, updateGroupWithCapabilities, getCapabilityMatrix } from "@/lib/api/group-api";
import CapabilityMatrix from "./CapabilityMatrix";
import toast from "react-hot-toast";
import ConfirmModal from "../common/ConfirmModal";

const InputField = ({ label, required, error, register, name, type = "text", placeholder, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
        } ${disabled ? "bg-gray-50 text-gray-500" : ""}`}
      {...register(name)}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, error, register, name, placeholder }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea
      placeholder={placeholder}
      rows={4}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 resize-none ${error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
        }`}
      {...register(name)}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const SelectField = ({ label, required, error, control, name, options, placeholder }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          options={options}
          placeholder={placeholder || `Select ${label}`}
          isClearable={true}
          isSearchable={required ? true : false}
          value={options.find((c) => c.value === field.value) || null}
          onChange={(val) => field.onChange(val ? val.value : "")}
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: error ? '#f87171' : '#d1d5db',
              borderRadius: '0.5rem',
              minHeight: '42px',
              boxShadow: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#9ca3af'
              }
            }),
            option: (base) => ({
              ...base,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: '0.875rem'
            }),
            placeholder: (base) => ({
              ...base,
              fontSize: '0.875rem'
            })
          }}
        />
      )}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default function GroupForm({ mode = "create", defaultValues: initialValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, data: null });

  const defaultValues = useMemo(() => ({
    groupCode: "",
    groupName: "",
    description: "",
    status: "Active",
    ...initialValues,
  }), [initialValues]);

  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(mode === "create" ? groupAddSchema : groupEditSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (initialValues) reset({ ...defaultValues, ...initialValues });
  }, [initialValues]);

  // Load capabilities matrix
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
    // Only load matrix if we are in create mode OR in edit mode and initialValues are ready
    if (mode === "create" || (mode === "edit" && initialValues?.id)) {
      loadMatrix();
    }
  }, [mode, initialValues?.id]);

  const onFormValid = (data) => {
    if (selectedCodes.length === 0) {
      toast.error("Please select at least one capability");
      return;
    }
    setConfirmState({ isOpen: true, type: "submit", data });
  };

  const handleActualSubmit = useCallback(async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        capabilityCodes: selectedCodes,
      };

      const response = mode === "create"
        ? await saveGroupWithCapabilities(payload)
        : await updateGroupWithCapabilities(payload);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(mode === "create" ? "Group created successfully!" : "Group updated successfully!");
        router.push("/group");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} group`);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [mode, router, selectedCodes]);

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "InActive" },
  ];

  return (
    <div className="h-full mx-6 overflow-y-auto">
      <form
        onSubmit={handleSubmit(onFormValid)}
        className="bg-white rounded-xl p-6 shadow-sm space-y-6"
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Group Details
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <InputField
              label="Group Code"
              required
              name="groupCode"
              placeholder="e.g. SALES_TEAM"
              register={register}
              error={errors.groupCode?.message}
              disabled={mode === "edit"}
            />
            <InputField
              label="Group Name"
              required
              name="groupName"
              placeholder="Enter group name"
              register={register}
              error={errors.groupName?.message}
            />
            <div className="md:col-span-2">
              <TextareaField
                label="Description"
                name="description"
                placeholder="Enter group description (optional)"
                register={register}
                error={errors.description?.message}
              />
            </div>
            <SelectField
              label="Status"
              required
              name="status"
              control={control}
              options={statusOptions}
              error={errors.status?.message}
            />
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
            onChange={setSelectedCodes}
          />
        )}

        <div className="flex gap-3 justify-center   pt-4">
          <button
            type="button"
            onClick={() => {
              if (isDirty || selectedCodes.length > 0) {
                setConfirmState({ isOpen: true, type: "discard", data: null });
              } else {
                router.back();
              }
            }}
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
        title={confirmState.type === "submit" ? "Confirm Submission" : "Discard Changes"}
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
        onCancel={() => setConfirmState({ isOpen: false, type: null, data: null })}
      />
    </div>
  );
}
