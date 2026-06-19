"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { groupAddSchema, groupEditSchema } from "@/lib/validation/group.schema";
import { createGroup, updateGroup } from "@/lib/api/group-api";
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

  const onSubmit = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = mode === "create"
        ? await createGroup(data)
        : await updateGroup(data);

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
  }, [mode, router]);

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

      <div className="flex gap-3 justify-end border-t pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => reset(defaultValues)}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={loading}
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
