"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import {
  Building2,
  Camera,
  X,
  MapPin,
  Briefcase,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  companyAddSchema,
  companyEditSchema,
} from "@/lib/validation/company-add-update.schema";
import { listCompanies } from "@/lib/api/company-api";
import { listCurrencies } from "@/lib/api/currency-api";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "../common/ConfirmModal";

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

const ALL_COUNTRIES = Country.getAllCountries();
const findCountryByName = (name) => ALL_COUNTRIES.find((c) => c.name === name);

const COUNTRY_OPTIONS = ALL_COUNTRIES.map((c) => ({
  label: c.name,
  value: c.name,
}));

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
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
  companyName: "",
  parentCompanyId: "",
  shortName: "",
  companyCode: "",
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
  supportedCurrencies: [],
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

export default function CompanyForm({
  mode = "create",
  parentCompanies: parentCompaniesProp,
  submitFn,
  defaultValues: externalDefaults = {},
}) {
  const router = useRouter();
  const user = useAuth();

  const initialData = { ...BASE_DEFAULTS, ...externalDefaults };
  const parentCompanyOptions = (parentCompaniesProp || []).map((c) => ({
    label: c.companyName,
    value: c.id,
  }));

  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const [parentCompanies, setParentCompanies] = useState(
    parentCompaniesProp ?? []
  );
  const [parentLoading, setParentLoading] = useState(false);

  const [currencies, setCurrencies] = useState([]);
  const [currencyLoading, setCurrencyLoading] = useState(false);

  const currencyOptions = currencies.map((c) => ({
    label: `${c.currencyCode} - ${c.currencyName}`,
    value: c.currencyCode,
  }));

  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    externalDefaults?.logoUrl || null
  );

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const [isInitialMount, setIsInitialMount] = useState(true);

  const serializedDefaults = externalDefaults ? JSON.stringify(externalDefaults) : null;
  useEffect(() => {
    if (externalDefaults) {
      setFormData({
        ...BASE_DEFAULTS,
        ...externalDefaults,
      });
      if (externalDefaults.logoUrl) {
        setLogoPreview(externalDefaults.logoUrl);
      }
    }
  }, [serializedDefaults]);

  useEffect(() => {
    let cancelled = false;
    setCurrencyLoading(true);
    listCurrencies({ page: 1, limit: 100, search: "" })
      .then((res) => {
        if (cancelled) return;
        const list = res?.settings?.data?.list || res?.data?.list || [];
        setCurrencies(list);
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setCurrencyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  }, [parentCompaniesProp, mode, externalDefaults?.id]);

  useEffect(() => {
    if (!formData.country) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }
    const countryObj = findCountryByName(formData.country);
    if (!countryObj) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }

    const states = State.getStatesOfCountry(countryObj.isoCode).map((s) => ({
      label: s.name,
      value: s.name,
      isoCode: s.isoCode,
    }));
    setStateOptions(states);
    setCityOptions([]);

    // if (countryObj.phonecode) {
    //   setFormData((prev) => ({
    //     ...prev,
    //     dialCode: `+${countryObj.phonecode}`,
    //   }));
    // }

    if (!isInitialMount) {
      setFormData((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
    }
  }, [formData.country, isInitialMount]);

  useEffect(() => {
    if (!formData.state || !formData.country) {
      setCityOptions([]);
      return;
    }
    const countryObj = findCountryByName(formData.country);
    const stateObj = stateOptions.find((s) => s.value === formData.state);
    if (!countryObj || !stateObj?.isoCode) {
      setCityOptions([]);
      return;
    }

    const cities = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode).map((c) => ({
      label: c.name,
      value: c.name,
    }));
    setCityOptions(cities);

    if (!isInitialMount) {
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
    }
  }, [formData.state, formData.country, stateOptions, isInitialMount]);

  useEffect(() => {
    const t = setTimeout(() => {
      setIsInitialMount(false);
    }, 300);
    return () => clearTimeout(t);
  }, []);

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

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type
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
    setIsDirty(true);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById("company-form-logo-input");
    if (fileInput) fileInput.value = "";
    setIsDirty(true);
  };

  const validateForm = () => {
    const schema = mode === "create" ? companyAddSchema : companyEditSchema;
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
    if (validateForm()) {
      setConfirmState({ isOpen: true, type: "submit", data: formData });
    }
  };

  const handleActualSubmit = async (data) => {
    const payload = { ...data };
    payload.companyName = payload.companyName.trim();
    payload.shortName = payload.shortName.trim();
    payload.legalName = payload.legalName?.trim() ?? "";
    payload.email = payload.email.trim().toLowerCase();

    delete payload.companyLogo;
    delete payload.logoUrl;

    if (!logoFile && !logoPreview) {
      payload.companyLogo = "";
    }

    if (!payload.companyCode) {
      payload.companyCode =
        payload.shortName
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_|_$/g, "") + Date.now().toString().slice(-3);
    }

    if (!payload.parentCompanyId) {
      delete payload.parentCompanyId;
    } else {
      payload.parentCompanyId = Number(payload.parentCompanyId);
    }

    if (mode === "create") {
      payload.addedBy = user?.user?.id;
    } else {
      payload.updatedBy = user?.user?.id;
    }
    try {
      setLoading(true);
      const res = await submitFn(payload, logoFile || null);

      if (res?.success === 0) {
        toast.error(
          res.message ||
          `Failed to ${mode === "create" ? "create" : "update"} company`
        );
        return;
      }

      toast.success(
        mode === "create"
          ? "Company created successfully"
          : "Company updated successfully"
      );
      router.push("/company");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${mode === "create" ? "create" : "update"} company`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.back();
    }
  };

  const activeParentCompanyOptions = (parentCompanies || []).map((c) => ({
    label: c.companyName,
    value: c.id,
  }));

  return (
    <div className="h-full overflow-y-scroll mx-6">
      <form onSubmit={handleFormSubmit} className="space-y-5 text-black">
        <div className="grid lg:grid-cols-[260px_1fr] gap-5">
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
                    onClick={() =>
                      document
                        .getElementById("company-form-logo-input")
                        ?.click()
                    }
                  >
                    <Building2 size={32} />
                    <span className="text-[10px] font-medium text-blue-400">
                      No logo
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("company-form-logo-input")?.click()
                  }
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

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("company-form-logo-input")?.click()
                  }
                  className="mt-1 px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium
                  text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer"
                >
                  {logoPreview ? "Change" : "Choose File"}
                </button>
              </div>

              <input
                id="company-form-logo-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <SectionHeader icon={Briefcase} title="Company Details" />

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.companyName ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Parent Company
                </label>
                <Select
                  instanceId="select-parentCompanyId"
                  value={
                    activeParentCompanyOptions.find(
                      (c) =>
                        String(c.value) === String(formData.parentCompanyId),
                    ) || null
                  }
                  onChange={(opt) =>
                    handleChange("parentCompanyId", opt ? opt.value : "")
                  }
                  options={activeParentCompanyOptions}
                  isDisabled={parentLoading}
                  isClearable={true}
                  isSearchable={true}
                  placeholder={parentLoading ? "Loading…" : "None (Top-level)"}
                  classNamePrefix="react-select"
                  styles={customSelectStyles(
                    errors.parentCompanyId,
                    parentLoading,
                  )}
                />
                {errors.parentCompanyId && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.parentCompanyId}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Short Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACME"
                  value={formData.shortName}
                  onChange={(e) => handleChange("shortName", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.shortName ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.shortName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.shortName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company Code
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated or enter custom code"
                  disabled={mode === "edit"}
                  value={formData.companyCode}
                  onChange={(e) => handleChange("companyCode", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                    ${mode === "edit" ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white hover:border-gray-300"}
                    ${errors.companyCode ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.companyCode && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.companyCode}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Legal Name
                </label>
                <input
                  type="text"
                  placeholder="Full legal / registered name"
                  value={formData.legalName}
                  onChange={(e) => handleChange("legalName", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.legalName ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.legalName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.legalName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Registration Number
                </label>
                <input
                  type="text"
                  placeholder="Enter registration number"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    handleChange("registrationNumber", e.target.value)
                  }
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.registrationNumber ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.registrationNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.registrationNumber}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Tax Number (GST / VAT)
                </label>
                <input
                  type="text"
                  placeholder="Enter tax number"
                  value={formData.taxNumber}
                  onChange={(e) => handleChange("taxNumber", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.taxNumber ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.taxNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.taxNumber}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Website
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.website ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.website && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.website}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="company@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status <span className="text-red-400">*</span>
                </label>
                <Select
                  instanceId="select-status"
                  value={
                    STATUS_OPTIONS.find((s) => s.value === formData.status) ||
                    null
                  }
                  onChange={(opt) =>
                    handleChange("status", opt ? opt.value : "")
                  }
                  options={STATUS_OPTIONS}
                  isClearable={true}
                  isSearchable={false}
                  placeholder="Select Status"
                  classNamePrefix="react-select"
                  styles={customSelectStyles(errors.status)}
                />
                {errors.status && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.status}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 lg:col-span-1 ">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Currency
                </label>
                {/* <Select
                    instanceId="select-currencies"
                    isMulti
                    value={currencyOptions.filter((opt) =>
                      (formData.supportedCurrencies || []).some(
                        (id) => String(id) === String(opt.value),
                      ),
                    )}
                    onChange={(selected) =>
                      handleChange(
                        "supportedCurrencies",
                        selected ? selected.map((s) => Number(s.value)) : [],
                      )
                    }
                    options={currencyOptions}
                    isLoading={currencyLoading}
                    placeholder="Select Supported Currencies"
                    classNamePrefix="react-select"
                    styles={customSelectStyles(errors.supportedCurrencies)}
                  /> */}

                <Select
                  instanceId="select-currencies"
                  isMulti
                  value={currencyOptions.filter((opt) =>
                    (formData.supportedCurrencies || []).some(
                      (id) => String(id) === String(opt.value),
                    ),
                  )}
                  onChange={(selected) => {
                    const limited =
                      selected && selected.length > 0
                        ? [selected[selected.length - 1]]
                        : [];
                    handleChange(
                      "supportedCurrencies",
                      limited.map((s) => s.value),
                    );
                  }}
                  options={currencyOptions}
                  isLoading={currencyLoading}
                  placeholder="Select Supported Currency"
                  classNamePrefix="react-select"
                  styles={customSelectStyles(errors.supportedCurrencies)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="w-[130px] shrink-0">
                    <Select
                      instanceId="select-dialCode"
                      value={
                        DIAL_CODE_OPTIONS.find(
                          (d) => d.value === formData.dialCode,
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("dialCode", opt ? opt.value : "")
                      }
                      options={DIAL_CODE_OPTIONS}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Code"
                      classNamePrefix="react-select"
                      styles={customSelectStyles(
                        errors.dialCode || errors.phone,
                      )}
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className={`flex-1 px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                      focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                      ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200"}
                    `}
                  />
                </div>
                {(errors.phone || errors.dialCode) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.phone || errors.dialCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <SectionHeader
              icon={MapPin}
              title="Address"
              color="text-emerald-600"
              bg="bg-emerald-50"
            />

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Address Line 1 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Street / building"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      handleChange("addressLine1", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                      focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                      ${errors.addressLine1 ? "border-red-400 bg-red-50" : "border-gray-200"}
                    `}
                  />
                  {errors.addressLine1 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.addressLine1}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    placeholder="Area / landmark (optional)"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      handleChange("addressLine2", e.target.value)
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                      focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                      ${errors.addressLine2 ? "border-red-400 bg-red-50" : "border-gray-200"}
                    `}
                  />
                  {errors.addressLine2 && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.addressLine2}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Country <span className="text-red-400">*</span>
                  </label>
                  <Select
                    instanceId="select-country"
                    value={
                      COUNTRY_OPTIONS.find(
                        (c) => c.value === formData.country,
                      ) || null
                    }
                    onChange={(opt) =>
                      handleChange("country", opt ? opt.value : "")
                    }
                    options={COUNTRY_OPTIONS}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Select Country"
                    classNamePrefix="react-select"
                    styles={customSelectStyles(errors.country)}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.country}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    State / Province <span className="text-red-400">*</span>
                  </label>
                  <Select
                    instanceId="select-state"
                    value={
                      stateOptions.find((s) => s.value === formData.state) ||
                      null
                    }
                    onChange={(opt) =>
                      handleChange("state", opt ? opt.value : "")
                    }
                    options={stateOptions}
                    isDisabled={!formData.country || stateOptions.length === 0}
                    isClearable={true}
                    isSearchable={true}
                    placeholder={
                      !formData.country
                        ? "Select country first"
                        : stateOptions.length === 0
                          ? "No states"
                          : "Select State"
                    }
                    classNamePrefix="react-select"
                    styles={customSelectStyles(
                      errors.state,
                      !formData.country || stateOptions.length === 0,
                    )}
                  />
                  {errors.state && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    City <span className="text-red-400">*</span>
                  </label>
                  <Select
                    instanceId="select-city"
                    value={
                      cityOptions.find((c) => c.value === formData.city) || null
                    }
                    onChange={(opt) =>
                      handleChange("city", opt ? opt.value : "")
                    }
                    options={cityOptions}
                    isDisabled={!formData.state || cityOptions.length === 0}
                    isClearable={true}
                    isSearchable={true}
                    placeholder={
                      !formData.state
                        ? "Select state first"
                        : cityOptions.length === 0
                          ? "No cities"
                          : "Select City"
                    }
                    classNamePrefix="react-select"
                    styles={customSelectStyles(
                      errors.city,
                      !formData.state || cityOptions.length === 0,
                    )}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Zip / Postal Code <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter zip code"
                    value={formData.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.zipCode ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                  />
                  {errors.zipCode && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <SectionHeader
              icon={User}
              title="Contact Person"
              color="text-violet-600"
              bg="bg-violet-50"
            />

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.contactPersonName}
                  onChange={(e) =>
                    handleChange("contactPersonName", e.target.value)
                  }
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.contactPersonName ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.contactPersonName && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.contactPersonName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact Person Email
                </label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contactPersonEmail}
                  onChange={(e) =>
                    handleChange("contactPersonEmail", e.target.value)
                  }
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                    focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                    ${errors.contactPersonEmail ? "border-red-400 bg-red-50" : "border-gray-200"}
                  `}
                />
                {errors.contactPersonEmail && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    {errors.contactPersonEmail}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact Person Phone
                </label>
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="w-[130px] shrink-0">
                      <Select
                        instanceId="select-dialCode"
                        value={
                          DIAL_CODE_OPTIONS.find(
                            (d) => d.value === formData.dialCode,
                          ) || null
                        }
                        onChange={(opt) =>
                          handleChange("dialCode", opt ? opt.value : "")
                        }
                        options={DIAL_CODE_OPTIONS}
                        isClearable={true}
                        isSearchable={true}
                        placeholder="Code"
                        classNamePrefix="react-select"
                        styles={customSelectStyles(
                          errors.dialCode || errors.contactPersonPhone,
                        )}
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className={`flex-1 px-3 py-2.5 border rounded-lg text-sm transition-all outline-none
                      focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white hover:border-gray-300
                      ${errors.contactPersonPhone ? "border-red-400 bg-red-50" : "border-gray-200"}
                    `}
                    />
                  </div>

                  {errors.contactPersonPhone && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      {errors.contactPersonPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex gap-3 justify-center items-center">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-5 py-2 border bg-white border-gray-300 rounded-lg text-md font-medium
            text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Discard
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[#1565c0] text-white text-md font-medium
            hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed
            transition cursor-pointer flex items-center gap-2"
          >
            Submit
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
