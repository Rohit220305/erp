// CompanyForm.jsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Country, State, City } from "country-state-city";
import {
  Building2,
  Camera,
  X,
  MapPin,
  Phone,
  User,
  Briefcase,
  Globe,
  Hash,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  companyAddSchema,
  companyEditSchema,
} from "@/lib/validation/company-add-update.schema";
import { listCompanies } from "@/lib/api/company-api";
import { useAuth } from "@/context/AuthContext";

// ─── Field Components ─────────────────────────────────────────────────────────

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
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
        focus:ring-2 focus:ring-blue-100 focus:border-blue-400
        ${error ? "border-red-400 bg-red-50" : "border-gray-200"}
        ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:border-gray-300"}
      `}
      {...register(name)}
    />
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>
    )}
  </div>
);

const SelectField = ({
  label,
  required,
  error,
  register,
  name,
  options = [],
  placeholder,
  disabled,
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <select
      disabled={disabled}
      className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
        focus:ring-2 focus:ring-blue-100 focus:border-blue-400
        ${error ? "border-red-400 bg-red-50" : "border-gray-200"}
        ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:border-gray-300"}
      `}
      {...register(name)}
    >
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>
    )}
  </div>
);

/**
 * PhoneField — placed in Address section directly below Country.
 * dialCode auto-updates when country changes.
 * `name`         → phone number input  → saved to `phone` field
 * `dialCodeName` → dial code select    → saved to `dialCode` field
 */
const PhoneField = ({
  label,
  required,
  error,
  register,
  name,
  dialCodeName,
  dialCodeOptions = [],
}) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <div className="flex gap-2">
      <select
        className={`w-28 shrink-0 px-2 py-2.5 border rounded-lg text-sm transition-all outline-none
          focus:ring-2 focus:ring-blue-100 focus:border-blue-400
          ${error ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"} bg-white
        `}
        {...register(dialCodeName)}
      >
        {dialCodeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <input
        type="tel"
        placeholder="Enter phone number"
        className={`flex-1 px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
          focus:ring-2 focus:ring-blue-100 focus:border-blue-400
          ${error ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"} bg-white
        `}
        {...register(name)}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>
    )}
  </div>
);

/** Section header with icon */
const SectionHeader = ({
  icon: Icon,
  title,
  color = "text-blue-600",
  bg = "bg-blue-50",
}) => (
  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-5">
    <div
      className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}
    >
      <Icon size={16} />
    </div>
    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
      {title}
    </h2>
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_COUNTRIES = Country.getAllCountries();
const findCountryByName = (name) => ALL_COUNTRIES.find((c) => c.name === name);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyForm({
  mode = "create",
  parentCompanies: parentCompaniesProp,
  submitFn,
  defaultValues: externalDefaults = {},
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const user = useAuth();
  // ── State ───────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [parentCompanies, setParentCompanies] = useState(
    parentCompaniesProp ?? [],
  );
  const [parentLoading, setParentLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    externalDefaults?.logoUrl || null,
  );
  const isInitialMount = useRef(true);

  // ── Form defaults ───────────────────────────────────────────────────────────
  const baseDefaults = {
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
  const mergedDefaults = { ...baseDefaults, ...externalDefaults };

  // ── React Hook Form ─────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      mode === "create" ? companyAddSchema : companyEditSchema,
    ),
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });

  const watchedCountry = useWatch({ control, name: "country" });
  const watchedState = useWatch({ control, name: "state" });

  // ── Fetch parent companies (client-side on add page) ────────────────────────
  useEffect(() => {
    if (parentCompaniesProp && parentCompaniesProp.length > 0) return;
    let cancelled = false;
    setParentLoading(true);
    listCompanies({ page: 1, limit: 200, search: "" })
      .then((res) => {
        if (cancelled) return;
        const list = res?.settings?.data?.list || res?.data?.list || [];
        const filtered =
          mode === "edit" && externalDefaults?.id
            ? list.filter((c) => c.id !== externalDefaults.id)
            : list;
        setParentCompanies(filtered);
      })
      .catch(() => {
        if (!cancelled) setParentCompanies([]);
      })
      .finally(() => {
        if (!cancelled) setParentLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Memoised options ────────────────────────────────────────────────────────
  const countryOptions = useMemo(
    () => ALL_COUNTRIES.map((c) => ({ label: c.name, value: c.name })),
    [],
  );

  const dialCodeOptions = useMemo(() => {
    const seen = new Set();
    return ALL_COUNTRIES.filter((c) => c.phonecode).reduce((acc, c) => {
      const val = `+${c.phonecode}`;
      if (!seen.has(val)) {
        seen.add(val);
        acc.push({ label: val, value: val });
      }
      return acc;
    }, []);
  }, []);

  // ── Effect: country → states + auto dial code ───────────────────────────────
  useEffect(() => {
    if (!watchedCountry) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }
    const countryObj = findCountryByName(watchedCountry);
    if (!countryObj) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }

    setStateOptions(
      State.getStatesOfCountry(countryObj.isoCode).map((s) => ({
        label: s.name,
        value: s.name,
        isoCode: s.isoCode,
      })),
    );
    setCityOptions([]);

    // Auto-update dial code when country changes
    if (countryObj.phonecode) {
      setValue("dialCode", `+${countryObj.phonecode}`, {
        shouldValidate: false,
      });
    }

    if (!isInitialMount.current) {
      setValue("state", "", { shouldValidate: false });
      setValue("city", "", { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCountry]);

  // ── Effect: state → cities ──────────────────────────────────────────────────
  useEffect(() => {
    if (!watchedState || !watchedCountry) {
      setCityOptions([]);
      return;
    }
    const countryObj = findCountryByName(watchedCountry);
    const stateObj = stateOptions.find((s) => s.value === watchedState);
    if (!countryObj || !stateObj?.isoCode) {
      setCityOptions([]);
      return;
    }

    setCityOptions(
      City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode).map((c) => ({
        label: c.name,
        value: c.name,
      })),
    );
    if (!isInitialMount.current)
      setValue("city", "", { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedState, stateOptions]);

  // ── Mark initial mount done ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      isInitialMount.current = false;
    }, 300);
    return () => clearTimeout(t);
  }, []);

  // ── Logo handlers ───────────────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be smaller than 5 MB");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "InActive", value: "InActive" },
  ];
  

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    data.companyName = data.companyName.trim();
    data.shortName = data.shortName.trim();
    data.legalName = data.legalName?.trim() ?? "";
    data.email = data.email.trim().toLowerCase();

    if (!data.companyCode) {
      data.companyCode =
        data.shortName
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_|_$/g, "") + Date.now().toString().slice(-3);
    }

    if (!data.parentCompanyId) {
      delete data.parentCompanyId;
    } else {
      data.parentCompanyId = Number(data.parentCompanyId);
    }

    mode === "create" ? data.createdBy = user?.user?.id : data.updatedBy = user?.user?.id;
    try {
      setLoading(true);
      const res = await submitFn(data, logoFile || null);

      if (res?.success === 0) {
        toast.error(
          res.message ||
            `Failed to ${mode === "create" ? "create" : "update"} company`,
        );
        return;
      }

      toast.success(
        mode === "create"
          ? "Company created successfully"
          : "Company updated successfully",
      );
      router.push("/company");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          `Failed to ${mode === "create" ? "create" : "update"} company`,
      );
    } finally {
      setLoading(false);
    }
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-black">
      {/* ── Row 1: Logo + Company Details side by side ── */}
      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        {/* Logo Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon={Building2} title="Company Logo" />

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Company logo"
                  className="w-28 h-28 rounded-xl object-cover border-2 border-blue-100 shadow"
                />
              ) : (
                <div
                  className="w-28 h-28 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50
                  border-2 border-dashed border-blue-200 flex flex-col items-center
                  justify-center text-blue-300 gap-1.5 cursor-pointer hover:border-blue-400
                  transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Building2 size={32} />
                  <span className="text-[10px] font-medium text-blue-400">
                    No logo
                  </span>
                </div>
              )}

              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2.5 -right-2.5 w-8 h-8 rounded-full
                  bg-[#1565c0] text-white flex items-center justify-center
                  shadow-lg hover:bg-[#0f57a6] transition cursor-pointer"
                title="Upload logo"
              >
                <Camera size={14} />
              </button>

              {logoPreview && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full
                    bg-red-500 text-white flex items-center justify-center
                    shadow hover:bg-red-600 transition cursor-pointer"
                  title="Remove logo"
                >
                  <X size={11} />
                </button>
              )}
            </div>

            <div className="text-center space-y-1">
              <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                {logoFile ? logoFile.name : "Upload company logo"}
              </p>
              <p className="text-[10px] text-gray-400">
                JPG, PNG or WEBP · Max 5 MB
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium
                  text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
              >
                {logoPreview ? "Change" : "Choose File"}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        {/* Company Details Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader icon={Briefcase} title="Company Details" />

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
            <InputField
              label="Company Name"
              required
              error={errors.companyName?.message}
              register={register}
              name="companyName"
              placeholder="Enter company name"
            />

            {/* Parent Company */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Parent Company
              </label>
              <select
                disabled={parentLoading}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                  focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                  ${errors.parentCompanyId ? "border-red-400 bg-red-50" : "border-gray-200"}
                  ${parentLoading ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:border-gray-300"}
                `}
                {...register("parentCompanyId")}
              >
                <option value="">
                  {parentLoading ? "Loading…" : "None (Top-level)"}
                </option>
                {parentCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
              {errors.parentCompanyId && (
                <p className="text-xs text-red-500">
                  ⚠ {errors.parentCompanyId.message}
                </p>
              )}
            </div>

            <InputField
              label="Short Name"
              required
              error={errors.shortName?.message}
              register={register}
              name="shortName"
              placeholder="e.g. ACME"
            />

            <InputField
              label="Company Code"
              error={errors.companyCode?.message}
              register={register}
              name="companyCode"
              placeholder="Auto-generated or enter custom code"
            />

            <InputField
              label="Legal Name"
              error={errors.legalName?.message}
              register={register}
              name="legalName"
              placeholder="Full legal / registered name"
            />

            <InputField
              label="Registration Number"
              error={errors.registrationNumber?.message}
              register={register}
              name="registrationNumber"
              placeholder="Enter registration number"
            />

            <InputField
              label="Tax Number (GST / VAT)"
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
              label="Company Email"
              required
              error={errors.email?.message}
              register={register}
              name="email"
              placeholder="company@example.com"
              type="email"
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
      </div>

      {/* ── Row 2: Address + Contact Person side by side ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Address Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader
            icon={MapPin}
            title="Address"
            color="text-emerald-600"
            bg="bg-emerald-50"
          />

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Address Line 1"
                required
                error={errors.addressLine1?.message}
                register={register}
                name="addressLine1"
                placeholder="Street / building"
              />
              <InputField
                label="Address Line 2"
                error={errors.addressLine2?.message}
                register={register}
                name="addressLine2"
                placeholder="Area / landmark (optional)"
              />
            </div>

            {/* Country */}
            <SelectField
              label="Country"
              required
              error={errors.country?.message}
              register={register}
              name="country"
              options={countryOptions}
              placeholder="Select Country"
            />

            {/* Phone + Dial Code — lives directly below Country; dial code auto-fills from country */}
            <PhoneField
              label="Phone Number"
              required
              error={errors.phone?.message || errors.dialCode?.message}
              register={register}
              name="phone"
              dialCodeName="dialCode"
              dialCodeOptions={dialCodeOptions}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* State */}
              <SelectField
                label="State / Province"
                required
                error={errors.state?.message}
                register={register}
                name="state"
                options={stateOptions}
                placeholder={
                  !watchedCountry
                    ? "Select country first"
                    : stateOptions.length === 0
                      ? "No states"
                      : "Select State"
                }
                disabled={!watchedCountry || stateOptions.length === 0}
              />

              {/* City */}
              <SelectField
                label="City"
                required
                error={errors.city?.message}
                register={register}
                name="city"
                options={cityOptions}
                placeholder={
                  !watchedState
                    ? "Select state first"
                    : cityOptions.length === 0
                      ? "No cities"
                      : "Select City"
                }
                disabled={!watchedState || cityOptions.length === 0}
              />
            </div>

            <InputField
              label="Zip / Postal Code"
              required
              error={errors.zipCode?.message}
              register={register}
              name="zipCode"
              placeholder="Enter zip code"
            />
          </div>
        </div>

        {/* Contact Person Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <SectionHeader
            icon={User}
            title="Contact Person"
            color="text-violet-600"
            bg="bg-violet-50"
          />

          <div className="space-y-5">
            <InputField
              label="Contact Person Name"
              error={errors.contactPersonName?.message}
              register={register}
              name="contactPersonName"
              placeholder="Full name"
            />

            <InputField
              label="Contact Person Email"
              error={errors.contactPersonEmail?.message}
              register={register}
              name="contactPersonEmail"
              placeholder="contact@example.com"
              type="email"
            />

            <InputField
              label="Contact Person Phone"
              error={errors.contactPersonPhone?.message}
              register={register}
              name="contactPersonPhone"
              placeholder="Phone number"
            />
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div
        className="bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100
        flex gap-3 justify-end items-center"
      >
        <p className="text-xs text-gray-400 mr-auto">
          {mode === "create"
            ? "All fields marked * are required"
            : `Editing company · ${externalDefaults?.companyName || ""}`}
        </p>

        <button
          type="button"
          onClick={() => {
            reset(mergedDefaults);
            setStateOptions([]);
            setCityOptions([]);
            setLogoFile(null);
            setLogoPreview(externalDefaults?.logoUrl || null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium
            text-gray-600 hover:bg-gray-50 transition cursor-pointer"
        >
          Discard
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-[#1565c0] text-white text-sm font-medium
            hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed
            transition cursor-pointer flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {mode === "create" ? "Creating…" : "Updating…"}
            </>
          ) : mode === "create" ? (
            "Create Company"
          ) : (
            "Update Company"
          )}
        </button>
      </div>
    </form>
  );
}
