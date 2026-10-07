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
  CheckCircle2,
  Info
} from "lucide-react";
import toast from "react-hot-toast";

import { customerCompanySchema } from "@/lib/validation/customer-company.schema";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import ConfirmModal from "../common/ConfirmModal";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { createCustomerCompany, updateCustomerCompany } from "@/lib/api/customer-company-api";

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
const findCountryByName = (name) => {
  if (!name) return null;
  const trimmed = String(name).trim().toLowerCase();
  return ALL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === trimmed || c.isoCode.toLowerCase() === trimmed
  );
};

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
  name: "",
  shortName: "",
  code: "",
  email: "",
  incorporationDate: "",
  referenceCode: "",
  remark: "",
  status: "Active",
  address: {
    address: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    phoneCode: "+91",
    phoneNumber: "",
    altPhoneCode: "+91",
    altPhoneNumber: "",
  },
  owner: {
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    customDate: "",
    phoneCode: "+91",
    phoneNumber: "",
    altPhoneCode: "+91",
    altPhoneNumber: "",
    isOwner: true,
  },
};

const sanitizeFormData = (data) => {
  const safeDate = (val) => (val ? new Date(val).toISOString().split("T")[0] : "");
  return {
    ...BASE_DEFAULTS,
    ...data,
    incorporationDate: safeDate(data.incorporationDate),
    address: { ...BASE_DEFAULTS.address, ...(data.address || {}) },
    owner: { 
      ...BASE_DEFAULTS.owner, 
      ...(data.owner || {}),
      dob: safeDate(data.owner?.dob),
      customDate: safeDate(data.owner?.customDate),
    },
  };
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.5rem",
    minHeight: "42px",
    backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#d1d5db",
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
    color: disabled ? "#9ca3af" : "#1f2937",
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#9ca3af",
  }),
});

const dialCodeSelectStyles = {
  control: (base) => ({
    ...base,
    border: "none",
    boxShadow: "none",
    backgroundColor: "transparent",
    minHeight: "40px",
    cursor: "pointer",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "0 4px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 0 0 8px",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#4b5563",
    fontWeight: "500",
  }),
  menu: (base) => ({
    ...base,
    width: "150px",
  }),
};

export default function CustomerCompanyForm({
  mode = "create",
  defaultValues = {},
}) {
  const router = useRouter();
  const user = useAuth();
  const { setConfig, resetConfig } = useHeader();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(sanitizeFormData(defaultValues));
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(defaultValues?.logoUrl || null);

  const [ownerFile, setOwnerFile] = useState(null);
  const [ownerPreview, setOwnerPreview] = useState(defaultValues?.owner?.profileImageUrl || null);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: `${mode === "create" ? "Add New" : "Edit"} Customer`,
        breadcrumbs: [
          { label: "Users" },
          
          { label: "Customer", href: buildRoute("customer-company", "list") },
          { label: mode === "create" ? "Add" : "Edit" },
        ],
      },
    });
    return () => resetConfig();
  }, [mode, setConfig, resetConfig]);

  useEffect(() => {
    if (!formData.address.country) {
      setStateOptions([]);
      return;
    }
    const countryObj = findCountryByName(formData.address.country);
    if (!countryObj) {
      setStateOptions([]);
      return;
    }
    const states = State.getStatesOfCountry(countryObj.isoCode).map((s) => ({
      label: s.name,
      value: s.name,
      isoCode: s.isoCode,
    }));
    setStateOptions(states);
  }, [formData.address.country]);

  useEffect(() => {
    if (!formData.address.state || !formData.address.country) {
      setCityOptions([]);
      return;
    }
    const countryObj = findCountryByName(formData.address.country);
    if (!countryObj) {
      setCityOptions([]);
      return;
    }
    const allStatesOfCountry = State.getStatesOfCountry(countryObj.isoCode);
    const stateTrimmed = String(formData.address.state).trim().toLowerCase();
    const stateObj = allStatesOfCountry.find(
      (s) => s.name.toLowerCase() === stateTrimmed || s.isoCode.toLowerCase() === stateTrimmed,
    );
    if (!stateObj) {
      setCityOptions([]);
      return;
    }

    const cities = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode).map((c) => ({
      label: c.name,
      value: c.name,
    }));
    setCityOptions(cities);
  }, [formData.address.state, formData.address.country]);

  const handleChange = (name, value, isAddress = false, isOwner = false) => {
    setFormData((prev) => {
      const updated = { ...prev };
      if (isAddress) {
        updated.address = { ...updated.address, [name]: value };
        if (name === "country") {
          updated.address.state = "";
          updated.address.city = "";
        } else if (name === "state") {
          updated.address.city = "";
        }
      } else if (isOwner) {
        updated.owner = { ...updated.owner, [name]: value };
      } else {
        updated[name] = value;
      }
      return updated;
    });
    setIsDirty(true);

    const errorKey = isAddress ? `address.${name}` : isOwner ? `owner.${name}` : name;
    if (errors[errorKey]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const removeFile = (setFile, setPreview, inputId) => {
    setFile(null);
    setPreview(null);
    const fileInput = document.getElementById(inputId);
    if (fileInput) fileInput.value = "";
    setIsDirty(true);
  };

  const validateStep1 = () => {
    const step1Schema = customerCompanySchema.pick({
      name: true,
      shortName: true,
      code: true,
      email: true,
      incorporationDate: true,
      referenceCode: true,
      remark: true,
      status: true,
      address: true
    });
    const result = step1Schema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      console.log("Validation Errors (Step 1):", fieldErrors);
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const validateAll = () => {
    const result = customerCompanySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      console.log("Validation Errors (All):", fieldErrors);
      setErrors(fieldErrors);

      if (Object.keys(fieldErrors).some(k => !k.startsWith("owner."))) {
        setCurrentStep(1);
      }
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleFormSubmit = () => {
    if (validateAll()) {
      setConfirmState({ isOpen: true, type: "submit", data: formData });
    } else {
      toast.error("Please fill all required fields correctly.");
    }
  };

  const handleActualSubmit = async (data) => {
    const payload = JSON.parse(JSON.stringify(data));
    
    if (payload.owner) {
      if (!payload.owner.dob) delete payload.owner.dob;
      if (!payload.owner.customDate) delete payload.owner.customDate;
      
      if (!payload.owner.firstName && !payload.owner.lastName && !payload.owner.email) {
        delete payload.owner;
      }
    }
    if (!payload.incorporationDate) delete payload.incorporationDate;

    if (!payload.code) {
      payload.code =
        payload.shortName
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_|_$/g, "") + Date.now().toString().slice(-3);
    }
    try {
      setLoading(true);
      console.log("Submitting payload:", payload, "Logo file:", logoFile);       
      const apiFn = mode === "create" ? createCustomerCompany : updateCustomerCompany;
      const res = await apiFn(payload, logoFile || null, ownerFile || null);

      if (res?.success === 0) {
        toast.error(res.message || `Failed to ${mode === "create" ? "create" : "update"}`);
        return;
      }
        toast.success(`Customer ${mode === "create" ? "created" : "updated"} successfully`);
      router.push(buildRoute("customer-company", "list"));
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.push(buildRoute("customer-company", "list"));
    }
  };

  return (
    <div className="flex flex-col h-full  relative">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentStep(1)}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white ${currentStep === 1 ? "bg-blue-600" : "bg-green-500"}`}
            >
              {currentStep === 2 ? <CheckCircle2 size={16} /> : "1"}
            </div>
            <span
              className={`text-sm font-semibold ${currentStep === 1 ? "text-gray-900" : "text-gray-500"}`}
            >
              Company Information
            </span>
          </div>
          <div className="w-6 h-px bg-gray-300"></div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
            >
              2
            </div>
            <span
              className={`text-sm font-semibold ${currentStep === 2 ? "text-gray-900" : "text-gray-400"}`}
            >
              Owner Information
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 ">
        <div className=" mx-auto space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {currentStep === 1 && (
            <>
              <div className=" ">
                <SectionHeader icon={Briefcase} title="Company Details" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Company Name <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Company Name"
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeFile(
                                setLogoFile,
                                setLogoPreview,
                                "logo-input",
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("logo-input").click()
                        }
                        className="px-4 py-2 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex-1 flex items-center justify-center gap-2"
                      >
                        <Camera size={14} />{" "}
                        {logoPreview ? "Change File" : "Choose File"}
                      </button>
                      <input
                        id="logo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(e, setLogoFile, setLogoPreview)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Company Short Name{" "}
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Company Short Name"
                      value={formData.shortName || ""}
                      onChange={(e) =>
                        handleChange("shortName", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white ${errors.shortName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                    {errors.shortName && (
                      <p className="text-xs text-red-500">{errors.shortName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Company Code <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Company Code"
                      disabled={mode === "edit"}
                      value={formData.code || ""}
                      onChange={(e) => handleChange("code", e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${mode === "edit" ? "bg-gray-100 cursor-not-allowed" : "bg-white"} ${errors.code ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.code && (
                      <p className="text-xs text-red-500">{errors.code}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Company Email <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter Company Email"
                      value={formData.email || ""}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Incorporation Date{" "}
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={
                        formData.incorporationDate
                          ? formData.incorporationDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("incorporationDate", e.target.value)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white ${errors.incorporationDate ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors.incorporationDate && (
                      <p className="text-xs text-red-500">
                        {errors.incorporationDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Reference Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Reference Code"
                      value={formData.referenceCode || ""}
                      onChange={(e) =>
                        handleChange("referenceCode", e.target.value)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="">
                <SectionHeader icon={Info} title="Contact Details" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Phone Number <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div
                      className={`flex border rounded-lg bg-white overflow-hidden ${errors["address.phoneNumber"] ? "border-red-400" : "border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"}`}
                    >
                      <div className="border-r border-gray-200 bg-gray-50 shrink-0">
                        <Select
                          instanceId="addr-phone-code"
                          value={DIAL_CODE_OPTIONS.find(
                            (o) => o.value === formData.address.phoneCode,
                          )}
                          onChange={(opt) =>
                            handleChange(
                              "phoneCode",
                              opt ? opt.value : "",
                              true,
                            )
                          }
                          options={DIAL_CODE_OPTIONS}
                          styles={dialCodeSelectStyles}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="802 123 4567"
                        value={formData.address.phoneNumber || ""}
                        onChange={(e) =>
                          handleChange(
                            "phoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 15),
                            true,
                          )
                        }
                        className="w-full px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    {errors["address.phoneNumber"] && (
                      <p className="text-xs text-red-500">
                        {errors["address.phoneNumber"]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Alt Phone Number
                    </label>
                    <div className="flex border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                      <div className="border-r border-gray-200 bg-gray-50 shrink-0">
                        <Select
                          instanceId="addr-alt-phone-code"
                          value={DIAL_CODE_OPTIONS.find(
                            (o) => o.value === formData.address.altPhoneCode,
                          )}
                          onChange={(opt) =>
                            handleChange(
                              "altPhoneCode",
                              opt ? opt.value : "",
                              true,
                            )
                          }
                          options={DIAL_CODE_OPTIONS}
                          styles={dialCodeSelectStyles}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="802 123 4567"
                        value={formData.address.altPhoneNumber || ""}
                        onChange={(e) =>
                          handleChange(
                            "altPhoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 15),
                            true,
                          )
                        }
                        className="w-full px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="">
                <SectionHeader icon={MapPin} title="Company Address" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Address <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a location"
                      value={formData.address.address || ""}
                      onChange={(e) =>
                        handleChange("address", e.target.value, true)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors["address.address"] ? "border-red-400" : "border-gray-200"}`}
                    />
                    {errors["address.address"] && (
                      <p className="text-xs text-red-500">
                        {errors["address.address"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Country <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Select
                      instanceId="addr-country"
                      value={
                        COUNTRY_OPTIONS.find(
                          (c) => c.value === formData.address.country,
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("country", opt ? opt.value : "", true)
                      }
                      options={COUNTRY_OPTIONS}
                      placeholder="Select Country"
                      classNamePrefix="react-select"
                      styles={customSelectStyles(errors["address.country"])}
                    />
                    {errors["address.country"] && (
                      <p className="text-xs text-red-500">
                        {errors["address.country"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      State <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Select
                      instanceId="addr-state"
                      value={
                        stateOptions.find(
                          (s) => s.value === formData.address.state,
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("state", opt ? opt.value : "", true)
                      }
                      options={stateOptions}
                      isDisabled={!formData.address.country}
                      placeholder="Select State"
                      classNamePrefix="react-select"
                      styles={customSelectStyles(
                        errors["address.state"],
                        !formData.address.country,
                      )}
                    />
                    {errors["address.state"] && (
                      <p className="text-xs text-red-500">
                        {errors["address.state"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      City
                    </label>
                    <Select
                      instanceId="addr-city"
                      value={
                        cityOptions.find(
                          (c) => c.value === formData.address.city,
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("city", opt ? opt.value : "", true)
                      }
                      options={cityOptions}
                      isDisabled={!formData.address.state}
                      placeholder="Select City"
                      classNamePrefix="react-select"
                      styles={customSelectStyles(
                        false,
                        !formData.address.state,
                      )}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Zip Code"
                      value={formData.address.zipCode || ""}
                      onChange={(e) =>
                        handleChange("zipCode", e.target.value, true)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="">
                <SectionHeader icon={Info} title="Other Information" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Remarks
                    </label>
                    <textarea
                      placeholder="Enter Remarks"
                      value={formData.remark || ""}
                      onChange={(e) => handleChange("remark", e.target.value)}
                      rows={1}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Status <span className="text-red-400 ml-1">*</span>
                    </label>
                    <Select
                      instanceId="status"
                      value={
                        STATUS_OPTIONS.find(
                          (s) => s.value === formData.status,
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("status", opt ? opt.value : "")
                      }
                      options={STATUS_OPTIONS}
                      placeholder="Select Status"
                      classNamePrefix="react-select"
                      styles={customSelectStyles(errors.status)}
                    />
                    {errors.status && (
                      <p className="text-xs text-red-500">{errors.status}</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-800">Details</h3>
                <div className="grid grid-cols-3 gap-6 border-t border-gray-100 pt-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      Company Name
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formData.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      Company Code
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formData.code || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      Company Email
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formData.email || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <SectionHeader icon={User} title="Owner Details" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      First Name <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter First Name"
                      value={formData.owner.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value, false, true)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors["owner.firstName"] ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors["owner.firstName"] && (
                      <p className="text-xs text-red-500">
                        {errors["owner.firstName"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Last Name <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Last Name"
                      value={formData.owner.lastName || ""}
                      onChange={(e) =>
                        handleChange("lastName", e.target.value, false, true)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors["owner.lastName"] ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors["owner.lastName"] && (
                      <p className="text-xs text-red-500">
                        {errors["owner.lastName"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Email <span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter Email"
                      value={formData.owner.email || ""}
                      onChange={(e) =>
                        handleChange("email", e.target.value, false, true)
                      }
                      className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${errors["owner.email"] ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                    />
                    {errors["owner.email"] && (
                      <p className="text-xs text-red-500">
                        {errors["owner.email"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      {ownerPreview ? (
                        <div className="relative">
                          <img
                            src={ownerPreview}
                            alt="Owner"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeFile(
                                setOwnerFile,
                                setOwnerPreview,
                                "owner-input",
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={() =>
                          document.getElementById("owner-input").click()
                        }
                        className="px-4 py-2 border border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex-1 flex items-center justify-center gap-2"
                      >
                        <Camera size={14} />{" "}
                        {ownerPreview ? "Change File" : "Choose File"}
                      </button>
                      <input
                        id="owner-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileChange(e, setOwnerFile, setOwnerPreview)
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Date Of Birth
                    </label>
                    <input
                      type="date"
                      value={
                        formData.owner.dob
                          ? formData.owner.dob.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("dob", e.target.value, false, true)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <SectionHeader icon={Info} title="Contact Details" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Phone Number <span className="text-red-400 ml-1">*</span>
                    </label>
                    <div
                      className={`flex border rounded-lg bg-white overflow-hidden ${errors["owner.phoneNumber"] ? "border-red-400" : "border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"}`}
                    >
                      <div className="border-r border-gray-200 bg-gray-50 shrink-0">
                        <Select
                          instanceId="owner-phone-code"
                          value={DIAL_CODE_OPTIONS.find(
                            (o) => o.value === formData.owner.phoneCode,
                          )}
                          onChange={(opt) =>
                            handleChange(
                              "phoneCode",
                              opt ? opt.value : "",
                              false,
                              true,
                            )
                          }
                          options={DIAL_CODE_OPTIONS}
                          styles={dialCodeSelectStyles}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="802 123 4567"
                        value={formData.owner.phoneNumber || ""}
                        onChange={(e) =>
                          handleChange(
                            "phoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 15),
                            false,
                            true,
                          )
                        }
                        className="w-full px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    {errors["owner.phoneNumber"] && (
                      <p className="text-xs text-red-500">
                        {errors["owner.phoneNumber"]}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Alt Phone Number
                    </label>
                    <div className="flex border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                      <div className="border-r border-gray-200 bg-gray-50 shrink-0">
                        <Select
                          instanceId="owner-alt-phone-code"
                          value={DIAL_CODE_OPTIONS.find(
                            (o) => o.value === formData.owner.altPhoneCode,
                          )}
                          onChange={(opt) =>
                            handleChange(
                              "altPhoneCode",
                              opt ? opt.value : "",
                              false,
                              true,
                            )
                          }
                          options={DIAL_CODE_OPTIONS}
                          styles={dialCodeSelectStyles}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="802 123 4567"
                        value={formData.owner.altPhoneNumber || ""}
                        onChange={(e) =>
                          handleChange(
                            "altPhoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 15),
                            false,
                            true,
                          )
                        }
                        className="w-full px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <SectionHeader icon={Info} title="Extra Information" />
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                      Custom Date
                    </label>
                    <input
                      type="date"
                      value={
                        formData.owner.customDate
                          ? formData.owner.customDate.split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("customDate", e.target.value, false, true)
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-center gap-3 z-20">
        {currentStep === 1 && (
          <>
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-2 bg-blue-600  cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Next
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-6 py-2 border  cursor-pointer border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Discard
            </button>
          </>
        )}
        {currentStep === 2 && (
          <>
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border  cursor-pointer border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={loading}
              className="px-8 py-2 bg-blue-600 cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-6 py-2 border border-gray-200  cursor-pointer text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Discard
            </button>
          </>
        )}
      </div>

      {confirmState.isOpen && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() =>
            setConfirmState({ isOpen: false, type: null, data: null })
          }
          onConfirm={() => {
            if (confirmState.type === "submit") {
              setConfirmState({ isOpen: false, type: null, data: null });
              handleActualSubmit(confirmState.data);
            } else {
              setConfirmState({ isOpen: false, type: null, data: null });
              router.push(buildRoute("customer-company", "list"));
            }
          }}
          title={
            confirmState.type === "submit"
              ? "Confirm Submission"
              : "Discard Changes"
          }
          message={
            confirmState.type === "submit"
              ? `Are you sure you want to ${mode === "create" ? "create" : "update"} this customer?`
              : "Are you sure you want to discard your changes? This action cannot be undone."
          }
          confirmText={confirmState.type === "submit" ? "Submit" : "Discard"}
          type={confirmState.type === "submit" ? "primary" : "danger"}
        />
      )}
    </div>
  );
}
