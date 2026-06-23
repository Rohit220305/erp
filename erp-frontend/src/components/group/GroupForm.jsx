"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupAddSchema, groupEditSchema } from "@/lib/validation/group.schema";
import { saveGroupWithCapabilities, updateGroupWithCapabilities, getCapabilityMatrix } from "@/lib/api/group-api";
import CapabilityMatrix from "./CapabilityMatrix";
import toast from "react-hot-toast";

const InputField = ({ label, required, error, register, name, type = "text", placeholder, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
        error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
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
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 resize-none ${
        error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
      }`}
      {...register(name)}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const SelectField = ({ label, required, error, register, name, options, placeholder }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
        error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
      }`}
      {...register(name)}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default function GroupForm({ mode = "create", defaultValues: initialValues }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [matrixLoading, setMatrixLoading] = useState(true);

  const defaultValues = useMemo(() => ({
    groupCode: "",
    groupName: "",
    description: "",
    status: "Active",
    ...initialValues,
  }), [initialValues]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
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

  const onSubmit = useCallback(async (data) => {
    if (selectedCodes.length === 0) {
      toast.error("Please select at least one capability");
      return;
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Group Details</h2>
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
            register={register}
            options={statusOptions}
            error={errors.status?.message}
          />
        </div>
      </div>

      {matrixLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">Loading capability matrix...</div>
      ) : (
        <CapabilityMatrix
          capabilities={capabilities}
          selectedCodes={selectedCodes}
          onChange={setSelectedCodes}
        />
      )}

      <div className="flex gap-3 justify-end   pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            reset(defaultValues);
            const preselected = capabilities.filter((c) => c.assigned).map((c) => c.capabilityCode);
            setSelectedCodes(preselected);
          }}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading || matrixLoading}
          className="px-6 py-2 bg-[#1565c0] text-white rounded-lg text-sm font-medium hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {loading
            ? mode === "create" ? "Creating..." : "Updating..."
            : mode === "create" ? "Create Group" : "Update Group"}
        </button>
      </div>
    </form>
  );
}
