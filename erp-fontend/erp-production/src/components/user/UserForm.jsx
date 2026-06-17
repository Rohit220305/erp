"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userAddSchema, userEditSchema } from "@/lib/validation/user.schema";
import { createUser, updateUser } from "@/lib/api/user-api";
import { listCompanies } from "@/lib/api/company-api";
import { listGroups } from "@/lib/api/group-api";
import { useAuth } from "@/context/AuthContext";
import { Camera, Eye, EyeOff } from "lucide-react";
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

const SelectField = ({ label, required, error, register, name, options, placeholder, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
        error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
      } ${disabled ? "bg-gray-50 text-gray-500" : ""}`}
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

export default function UserForm({ mode = "create", defaultValues: initialValues }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photoUrl || null);
  const [companies, setCompanies] = useState([]);
  const [groups, setGroups] = useState([]);
  const fileInputRef = useRef(null);

  const defaultValues = useMemo(() => ({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    companyId: "",
    groupId: "",
    dialCode: "+91",
    phone: "",
    status: "Active",
    isSuperAdmin: false,
    ...initialValues,
  }), [initialValues]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(mode === "create" ? userAddSchema : userEditSchema),
    defaultValues,
    mode: "onBlur",
  });

  // Load companies and groups for dropdowns
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [cRes, gRes] = await Promise.all([
          listCompanies({ page: 1, limit: 100, search: "" }),
          listGroups({ page: 1, limit: 100, search: "" }),
        ]);
        const cData = cRes?.settings?.data || cRes?.data || {};
        const gData = gRes?.settings?.data || gRes?.data || {};
        setCompanies(cData.list || []);
        setGroups(gData.list || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (initialValues) {
      reset({ ...defaultValues, ...initialValues });
      setPhotoPreview(initialValues.photoUrl || null);
    }
  }, [initialValues]);

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const onSubmit = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = mode === "create"
        ? await createUser(data, photoFile)
        : await updateUser(data, photoFile);

      if (response?.success === 1) {
        toast.success(mode === "create" ? "User created successfully!" : "User updated successfully!");
        router.push("/admin");
      } else {
        toast.error(response?.message || `Failed to ${mode === "create" ? "create" : "update"} user`);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [mode, router, photoFile]);

  const dialCodes = ["+91", "+1", "+44", "+971", "+966"];
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "InActive" },
  ];
  const companyOptions = useMemo(() => companies.map((c) => ({ label: c.companyName, value: c.id })), [companies]);
  const groupOptions = useMemo(() => groups.map((g) => ({ label: g.groupName, value: g.id })), [groups]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm space-y-6">
      {/* Photo Upload */}
      <div className="flex items-center gap-6 pb-6 border-b">
        <div className="relative">
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-50 text-[#1565c0] flex items-center justify-center text-2xl font-bold border-2 border-blue-200">
              {watch("firstName")?.[0] || "U"}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[#1565c0] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#0f57a6] transition cursor-pointer"
          >
            <Camera size={13} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div>
          <p className="font-medium text-gray-800">Profile Photo</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
          {photoFile && <p className="text-xs text-green-600 mt-1">{photoFile.name}</p>}
        </div>
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <InputField label="First Name" required name="firstName" placeholder="Enter first name" register={register} error={errors.firstName?.message} />
          <InputField label="Last Name" required name="lastName" placeholder="Enter last name" register={register} error={errors.lastName?.message} />
          <InputField label="Username" required name="userName" placeholder="Enter username" register={register} error={errors.userName?.message} disabled={mode === "edit"} />
          <InputField label="Email" required name="email" type="email" placeholder="user@email.com" register={register} error={errors.email?.message} />

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Password {mode === "create" && <span className="text-red-500">*</span>}
              {mode === "edit" && <span className="text-xs text-gray-400 ml-1">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={mode === "create" ? "Enter password" : "Leave blank to keep current"}
                className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
                  errors.password ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
                }`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
        </div>
      </div>

      {/* Role & Company */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Company & Role</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <SelectField
            label="Company"
            required
            name="companyId"
            register={register}
            options={companyOptions}
            placeholder="Select Company"
            error={errors.companyId?.message}
            disabled={!currentUser?.isSuperAdmin}
          />
          <SelectField
            label="Group / Role"
            required
            name="groupId"
            register={register}
            options={groupOptions}
            placeholder="Select Group"
            error={errors.groupId?.message}
          />
          <SelectField
            label="Status"
            required
            name="status"
            register={register}
            options={statusOptions}
            error={errors.status?.message}
          />
          {currentUser?.isSuperAdmin && (
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="isSuperAdmin" className="w-4 h-4 accent-[#1565c0]" {...register("isSuperAdmin")} />
              <label htmlFor="isSuperAdmin" className="text-sm font-medium text-gray-700 cursor-pointer">
                Grant Super Admin privileges
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Contact</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex gap-2">
              <select
                className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1565c0]"
                {...register("dialCode")}
              >
                {dialCodes.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="text"
                placeholder="Phone number"
                className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
                  errors.phone ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
                }`}
                {...register("phone")}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
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
          onClick={() => { reset(defaultValues); setPhotoFile(null); setPhotoPreview(initialValues?.photoUrl || null); }}
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
            : mode === "create" ? "Create User" : "Update User"}
        </button>
      </div>
    </form>
  );
}
