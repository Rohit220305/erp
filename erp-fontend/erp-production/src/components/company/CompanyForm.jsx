// CompanyForm.jsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  companyAddSchema,
  companyEditSchema,
} from "@/lib/validation/company-add-update.schema";

// Custom Input Component with Label and Error
const InputField = ({
  label,
  required,
  error,
  register,
  name,
  type = "text",
  placeholder,
  disabled,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border rounded ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...register(name)}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// Custom Select Component with Label and Error
const SelectField = ({
  label,
  required,
  error,
  register,
  name,
  options,
  placeholder,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      className={`w-full px-3 py-2 border rounded  transition ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      {...register(name)}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// Custom Phone Field with Dial Code
const PhoneField = ({
  label,
  required,
  error,
  register,
  name,
  dialCodeRegister,
  dialCodeName,
  dialCodeOptions,
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="flex gap-2">
      <select
        className={`w-24 px-3 py-2 border rounded-lg  transition ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...register(dialCodeName)}
      >
        {dialCodeOptions?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )) || (
          <>
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+971">+971</option>
          </>
        )}
      </select>
      <input
        type="text"
        placeholder="Phone Number"
        className={`w-full px-3 py-2 border rounded-lg  transition ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        // {...register(name)}
      />
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

// Custom Radio/Checkbox Component
const CheckboxField = ({ label, error, register, name }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="w-4 h-4 border-gray-300 rounded "
        {...register(name)}
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default function CompanyForm({
  mode = "create",
  parentCompanies = [],
  submitFn,
}) {
  const [loading, setLoading] = useState(false);

  const defaultValues = {
    companyName: "",
    parentCompanyId: "",
    shortName: "",
    legalName: "",
    registrationNumber: "",
    taxNumber: "",
    website: "",
    email: "",
    dialCode: "+91",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    status: "Active",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      mode === "create" ? companyAddSchema : companyEditSchema,
    ),
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await submitFn(data);

      alert(
        mode === "create"
          ? "Company created successfully"
          : "Company updated successfully",
      );

      if (mode === "create") reset();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${mode === "create" ? "create" : "update"} company`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Sample dial codes (you can replace with actual data)
  const dialCodeOptions = [
    { label: "+91", value: "+91" },
    { label: "+1", value: "+1" },
    { label: "+44", value: "+44" },
    { label: "+971", value: "+971" },
    { label: "+966", value: "+966" },
    { label: "+972", value: "+972" },
  ];

  // Sample status options
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "InActive", value: "InActive" },
  ];

  // Sample country options (replace with actual country data)
  const countryOptions = [
    { label: "India", value: "India" },
    { label: "USA", value: "USA" },
    { label: "UK", value: "UK" },
    { label: "UAE", value: "UAE" },
  ];

  // Sample state options (you can make dynamic based on country)
  const stateOptions = [
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Delhi", value: "Delhi" },
    { label: "Gujarat", value: "Gujarat" },
    { label: "California", value: "California" },
  ];

  // Sample city options
  const cityOptions = [
    { label: "Mumbai", value: "Mumbai" },
    { label: "Delhi", value: "Delhi" },
    { label: "Ahmedabad", value: "Ahmedabad" },
    { label: "Los Angeles", value: "Los Angeles" },
  ];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-xl p-6 shadow text-black space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Company Details
        </h2>

        <div className="grid md:grid-cols-2 gap-x-14 gap-y-8">
          <InputField
            label="Company Name"
            required
            error={errors.companyName?.message}
            register={register}
            name="companyName"
            placeholder="Enter company name"
            className=""
          />

          <SelectField
            label="Parent Company"
            error={errors.parentCompanyId?.message}
            register={register}
            name="parentCompanyId"
            options={parentCompanies.map((company) => ({
              label: company.companyName,
              value: company.id,
            }))}
            placeholder="Select Parent Company"
          />

          <InputField
            label="Short Name"
            required
            error={errors.shortName?.message}
            register={register}
            name="shortName"
            placeholder="Enter short name"
          />

          <InputField
            label="Legal Name"
            error={errors.legalName?.message}
            register={register}
            name="legalName"
            placeholder="Enter legal name"
          />

          <InputField
            label="Registration Number"
            error={errors.registrationNumber?.message}
            register={register}
            name="registrationNumber"
            placeholder="Enter registration number"
          />

          <InputField
            label="Tax Number"
            error={errors.taxNumber?.message}
            register={register}
            name="taxNumber"
            placeholder="Enter tax number"
          />

          <InputField
            label="Website"
            error={errors.website?.message}
            register={register}
            name="website"
            placeholder="https://example.com"
            type="url"
          />

          <InputField
            label="Email"
            required
            error={errors.email?.message}
            register={register}
            name="email"
            placeholder="company@email.com"
            type="email"
          />

          <PhoneField
            label="Phone Number"
            required
            error={errors.dialCode?.message}
            register={register}
            name="dialCode"
            dialCodeRegister={register}
            dialCodeName="dialCode"
            dialCodeOptions={dialCodeOptions}
          />

          {/* <InputField
            label="Phone Number"
            required
            error={errors.phone?.message}
            register={register}
            name="phone"
            placeholder="Enter phone number"
          /> */}
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Address
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Address Line 1"
            required
            error={errors.addressLine1?.message}
            register={register}
            name="addressLine1"
            placeholder="Enter address"
          />

          <InputField
            label="Address Line 2"
            error={errors.addressLine2?.message}
            register={register}
            name="addressLine2"
            placeholder="Enter address (optional)"
          />

          <SelectField
            label="Country"
            required
            error={errors.country?.message}
            register={register}
            name="country"
            options={countryOptions}
            placeholder="Select Country"
          />

          <SelectField
            label="State"
            required
            error={errors.state?.message}
            register={register}
            name="state"
            options={stateOptions}
            placeholder="Select State"
          />

          <SelectField
            label="City"
            required
            error={errors.city?.message}
            register={register}
            name="city"
            options={cityOptions}
            placeholder="Select City"
          />

          <InputField
            label="Zip Code"
            required
            error={errors.zipCode?.message}
            register={register}
            name="zipCode"
            placeholder="Enter zip code"
          />
        </div>
      </div>

      {/* Contact Person Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
          Contact Person
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            label="Contact Person Name"
            error={errors.contactPersonName?.message}
            register={register}
            name="contactPersonName"
            placeholder="Enter contact person name"
          />

          <InputField
            label="Contact Person Email"
            error={errors.contactPersonEmail?.message}
            register={register}
            name="contactPersonEmail"
            placeholder="contact@email.com"
            type="email"
          />

          <InputField
            label="Contact Person Phone"
            error={errors.contactPersonPhone?.message}
            register={register}
            name="contactPersonPhone"
            placeholder="Enter contact phone"
          />

          <SelectField
            label="Status"
            required
            error={errors.status?.message}
            register={register}
            name="status"
            options={statusOptions}
            placeholder="Select Status"
          />
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="mt-6 flex gap-3 justify-center border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
        >
          {loading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
              ? "Create Company"
              : "Update Company"}
        </button>

        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Discard
        </button>
      </div>
    </form>
  );
}
