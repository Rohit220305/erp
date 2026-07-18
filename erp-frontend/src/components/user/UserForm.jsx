"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { userAddSchema, userEditSchema } from "@/lib/validation/user.schema";
import { createUser, updateUser } from "@/lib/api/user-api";
import { listCompanies } from "@/lib/api/company-api";
import { listGroups } from "@/lib/api/group-api";
import { useAuth } from "@/context/AuthContext";
import { Camera, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Country } from "country-state-city";
import ConfirmModal from "../common/ConfirmModal";

const ALL_COUNTRIES = Country.getAllCountries();

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "InActive" },
];

const DIAL_CODE_OPTIONS = (() => {
  const seen = new Set();
  return ALL_COUNTRIES.filter((c) => c.phonecode).reduce((acc, c) => {
    const val = `+${c.phonecode}`;
    if (!seen.has(val)) {
      seen.add(val);
      acc.push({ label: val, value: val });
    }
    return acc;
  }, []);
})();

const BASE_DEFAULTS = {
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
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    borderColor: error ? "#f87171" : "#d1d5db",
    borderRadius: "0.5rem",
    minHeight: "40px",
    backgroundColor: disabled ? "#f9fafb" : "#ffffff",
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
});

export default function UserForm({ mode = "create", defaultValues: initialValues }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const defaultValues = {
    ...BASE_DEFAULTS,
    companyId: !currentUser?.isSuperAdmin ? currentUser?.companyId : "",
    ...initialValues,
  };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photoUrl || null);

  const [companies, setCompanies] = useState([]);
  const [groups, setGroups] = useState([]);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  // Sync initialValues when prop changes
  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...BASE_DEFAULTS,
        companyId: !currentUser?.isSuperAdmin ? currentUser?.companyId : "",
        ...initialValues,
      });
      setPhotoPreview(initialValues.photoUrl || null);
    }
  }, [initialValues, currentUser]);

  // Load Companies & Groups dropdown lists
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

  // Handle Field Value Change
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

  const companyOptions = (companies || []).map((c) => ({ label: c.companyName, value: c.id }));
  const groupOptions = (groups || []).map((g) => ({ label: g.groupName, value: g.id }));

  // Photo Change Handler (Standard function without useCallback)
  const handlePhotoChange = (e) => {
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
    setIsDirty(true);
  };

  // Validate form using Zod schema
  const validateForm = () => {
    const schema = mode === "create" ? userAddSchema : userEditSchema;
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
      toast.error("Please fill required fields in the form");
      return false;
    }

    setErrors({});
    return true;
  };

  // Pre-submit trigger
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmState({ isOpen: true, type: "submit", data: formData });
    }
  };

  // Actual submit handler (Standard Async Function without useCallback)
  const handleActualSubmit = async (data) => {
    const payload = { ...data };
    try {
      setLoading(true);
      mode === "create"
        ? (payload.addedBy = currentUser?.id)
        : (payload.updatedBy = currentUser?.id);

      if (mode === "edit" && initialValues?.id) {
        payload.id = initialValues.id;
      }

      if (!currentUser?.isSuperAdmin) {
        payload.companyId = currentUser?.companyId || initialValues?.companyId;
      }

      const response =
        mode === "create"
          ? await createUser(payload, photoFile)
          : await updateUser(payload, photoFile);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "User created successfully!"
            : "User updated successfully!"
        );
        router.push("/admin");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} user`);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Discard handler
  const handleDiscard = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.back();
    }
  };

  return (
    <div className="h-full overflow-y-auto mx-6">
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-xl p-6 shadow-sm space-y-6 text-black"
      >
        {/* Photo Upload Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-50 text-[#1565c0] flex items-center justify-center text-2xl font-bold border-2 border-blue-200">
                {formData.firstName?.[0] || "U"}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-[#1565c0] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#0f57a6] transition cursor-pointer"
              title="Upload Photo"
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>
          <div>
            <p className="font-medium text-gray-800">Profile Photo</p>
            <p className="text-xs text-gray-400 mt-1">
              JPG, PNG or GIF. Max 5MB.
            </p>
            {photoFile && (
              <p className="text-xs text-green-600 mt-1">{photoFile.name}</p>
            )}
          </div>
        </div>

        {/* ── 1. Personal Information ───────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
            Personal Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* First Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 bg-white
                  ${errors.firstName ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                `}
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">⚠ {errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 bg-white
                  ${errors.lastName ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                `}
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">⚠ {errors.lastName}</p>}
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter username"
                readOnly={mode === "edit"}
                value={formData.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20
                  ${errors.userName ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                  ${mode === "edit" ? "bg-gray-50 text-gray-500" : "bg-white"}
                `}
              />
              {errors.userName && <p className="text-xs text-red-500 mt-1">⚠ {errors.userName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="user@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 bg-white
                  ${errors.email ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                `}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">⚠ {errors.email}</p>}
            </div>

            {/* Password (Create Mode only) */}
            {mode === "create" && (
              <div className="space-y-1 relative">
                <label className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 bg-white
                      ${errors.password ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                    `}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">⚠ {errors.password}</p>}
              </div>
            )}

          </div>
        </div>

        {/* ── 2. Company & Role ─────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
            Company & Role
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Direct Inline Select: Company */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
              <Select
                instanceId="select-companyId"
                value={companyOptions.find((c) => String(c.value) === String(formData.companyId)) || null}
                onChange={(opt) => handleChange("companyId", opt ? opt.value : "")}
                options={companyOptions}
                isDisabled={!currentUser?.isSuperAdmin}
                isClearable={true}
                isSearchable={true}
                placeholder="Select Company"
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.companyId, !currentUser?.isSuperAdmin)}
              />
              {errors.companyId && <p className="text-xs text-red-500 mt-1">⚠ {errors.companyId}</p>}
            </div>

            {/* Direct Inline Select: Group / Role */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Group / Role <span className="text-red-500">*</span>
              </label>
              <Select
                instanceId="select-groupId"
                value={groupOptions.find((g) => String(g.value) === String(formData.groupId)) || null}
                onChange={(opt) => handleChange("groupId", opt ? opt.value : "")}
                options={groupOptions}
                isClearable={true}
                isSearchable={true}
                placeholder="Select Group"
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.groupId)}
              />
              {errors.groupId && <p className="text-xs text-red-500 mt-1">⚠ {errors.groupId}</p>}
            </div>

            {/* Direct Inline Select: Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Status <span className="text-red-500">*</span>
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
                styles={customSelectStyles(errors.status)}
              />
              {errors.status && <p className="text-xs text-red-500 mt-1">⚠ {errors.status}</p>}
            </div>

          </div>
        </div>

        {/* ── 3. Contact ────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
            Contact
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Phone Number with Direct Inline Select: Dial Code */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex gap-2">
                <div className="w-[120px] shrink-0">
                  <Select
                    instanceId="select-dialCode"
                    value={DIAL_CODE_OPTIONS.find((d) => d.value === formData.dialCode) || null}
                    onChange={(opt) => handleChange("dialCode", opt ? opt.value : "")}
                    options={DIAL_CODE_OPTIONS}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Code"
                    classNamePrefix="react-select"
                    styles={customSelectStyles(errors.dialCode || errors.phone)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1565c0]/20 bg-white
                    ${errors.phone ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}
                  `}
                />
              </div>
              {(errors.phone || errors.dialCode) && (
                <p className="text-xs text-red-500 mt-1">⚠ {errors.phone || errors.dialCode}</p>
              )}
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center border-t pt-4">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#1565c0] text-white rounded-lg text-sm font-medium hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
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
