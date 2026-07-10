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
import { Country } from "country-state-city";
import { Controller } from "react-hook-form";
import DialCodeSelect from "../common/DialCodeSelect";
import ConfirmModal from "../common/ConfirmModal";



import Select from "react-select";

const InputField = ({ label, required, error, register, name, type = "text", placeholder, disabled, readOnly }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
        } ${disabled || readOnly ? "bg-gray-50 text-gray-500" : ""}`}
      {...register(name)}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  required,
  error,
  control,
  name,
  options = [],
  placeholder,
  disabled,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          instanceId={name}
          isDisabled={disabled}
          options={options}
          placeholder={placeholder || `Select ${label}`}
          isClearable={true}
          isSearchable={true}
          value={options.find((c) => String(c.value) === String(field.value)) || null}
          onChange={(val) => field.onChange(val ? val.value : "")}
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: error ? '#f87171' : '#d1d5db',
              borderRadius: '0.5rem',
              minHeight: '38px',
              backgroundColor: disabled ? '#f9fafb' : '#ffffff',
              boxShadow: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              '&:hover': {
                borderColor: '#1565c0'
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
    {error && (
      <p className="text-xs text-red-500 mt-1">⚠ {error}</p>
    )}
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
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null, data: null });

  const ALL_COUNTRIES = Country.getAllCountries();


  const defaultValues = useMemo(() => ({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    companyId: !currentUser?.isSuperAdmin ? currentUser?.companyId : "",
    groupId: "",
    dialCode: "+91",
    phone: "",
    status: "Active",
    isSuperAdmin: false,
    ...initialValues,
  }), [initialValues, currentUser]);

  const { register, handleSubmit, control, reset, watch, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(mode === "create" ? userAddSchema : userEditSchema),
    defaultValues,
    mode: "onBlur",
  });

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

  const onFormValid = (data) => setConfirmState({ isOpen: true, type: "submit", data });

  const handleActualSubmit = useCallback(async (data) => {
    try {
      setLoading(true);
      mode === "create" ? data.addedBy = currentUser?.id : data.updatedBy = currentUser?.id;

      if (mode === "edit" && initialValues?.id) {
        data.id = initialValues.id;
      }

      if (!currentUser?.isSuperAdmin) {
        data.companyId = currentUser?.companyId || initialValues?.companyId;
      }

      const response = mode === "create"
        ? await createUser(data, photoFile)
        : await updateUser(data, photoFile);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(mode === "create" ? "User created successfully!" : "User updated successfully!");
        router.push("/admin");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} user`);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [mode, router, photoFile]);



  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "InActive" },
  ];
  const companyOptions = useMemo(() => companies.map((c) => ({ label: c.companyName, value: c.id })), [companies]);
  const groupOptions = useMemo(() => groups.map((g) => ({ label: g.groupName, value: g.id })), [groups]);

  return (
    <div className="h-full overflow-y-auto mx-6">
    <form
      onSubmit={handleSubmit(onFormValid, (errors) => {
        if (errors) {
          const safeErrors = Object.keys(errors).reduce((acc, key) => {
            acc[key] = {
              type: errors[key]?.type,
              message: errors[key]?.message,
            };
            return acc;
          }, {});
          const firstError = Object.values(errors)[0]?.message;
          toast.error( "Please fill required fields the form");
        }
      })}
      className="bg-white rounded-xl p-6 shadow-sm space-y-6"
    >
      {mode === "edit" && <input type="hidden" {...register("id")} />}

      {/* Photo Upload */}
      <div className="flex items-center gap-6 pb-6 ">
        <div className="relative">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
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

      {/* Personal Info */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
          Personal Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            required
            name="firstName"
            placeholder="Enter first name"
            register={register}
            error={errors.firstName?.message}
          />
          <InputField
            label="Last Name"
            required
            name="lastName"
            placeholder="Enter last name"
            register={register}
            error={errors.lastName?.message}
          />
          <InputField
            label="Username"
            required
            name="userName"
            placeholder="Enter username"
            register={register}
            error={errors.userName?.message}
            readOnly={mode === "edit"}
          />
          <InputField
            label="Email"
            required
            name="email"
            type="email"
            placeholder="user@email.com"
            register={register}
            error={errors.email?.message}
          />
          {mode === "create" && (
            <div className="space-y-1 relative">
              <label className="block text-sm font-medium text-gray-700">
                Password {mode === "create" && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                type={showPassword ? "text" : "password"}
                placeholder={"Enter password" }
                className={`w-full px-3 py-2 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${errors.password ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"}`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>)}

        </div>
      </div>

      {/* Role & Company */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
          Company & Role
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <SelectField
              label="Company"
              required
              name="companyId"
              control={control}
              options={companyOptions}
              error={errors.companyId?.message}
              disabled={!currentUser?.isSuperAdmin}
            />
            {!currentUser?.isSuperAdmin && (
              <input type="hidden" {...register("companyId")} value={currentUser?.companyId || initialValues?.companyId || ""} />
            )}
          </div>
          <SelectField
            label="Group / Role"
            required
            name="groupId"
            control={control}
            options={groupOptions}
            // placeholder="Select Group"
            error={errors.groupId?.message}
          />
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

      {/* Phone */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
          Contact
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="flex gap-2">

              <Controller
                name="dialCode"
                control={control}
                render={({ field }) => (
                  <DialCodeSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <input
                type="text"
                placeholder="Phone number"
                className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${errors.phone
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#1565c0]"
                  }`}
                {...register("phone")}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center border-t pt-4">
        <button
          type="button"
          onClick={() => {
            if (isDirty) {
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
          disabled={loading}
          className="px-6 py-2 bg-[#1565c0] text-white rounded-lg text-sm font-medium hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
        >
          Submit
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




