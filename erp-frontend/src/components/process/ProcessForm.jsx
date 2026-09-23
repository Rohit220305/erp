"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { useRouter } from "next/navigation";
import { createProcess, updateProcess } from "@/lib/api/process-api";
import { listCompanies } from "@/lib/api/company-api";
import { listWorkCentres } from "@/lib/api/work-centre-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import processConfig from "@/config/process.config.json";
import { getProcessSchema } from "@/lib/validation/process.schema";
import { X, Info, FileText } from "lucide-react";
import { buildRoute } from "@/lib/navigation/routeBuilder";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const BASE_DEFAULTS = {
  processCode: "",
  processName: "",
  description: "",
  status: "Active",
  workCentreId: "",
  companyId: "",
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
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#9ca3af",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
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

  dropdownIndicator: (base, state) => ({
    ...base,
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  })
});

export default function ProcessForm({
  mode = "create",
  initialData = null,
  id = null,
}) {
  const { can, user } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [workCentreOptions, setWorkCentreOptions] = useState([]);

  const defaultValues = { ...BASE_DEFAULTS, ...initialData };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState(false);

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(initialData?.instructionPdfUrl || null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [isDeletePdfModalOpen, setIsDeletePdfModalOpen] = useState(false);

  const [prevCompanyId, setPrevCompanyId] = useState(formData.companyId);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
      setImagePreview(initialData.imageUrl || null);
      setPdfPreview(initialData.instructionPdfUrl || null);
      setPrevCompanyId(initialData.companyId);
    }
  }, [initialData]);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      const loadOptions = async () => {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const compData = compRes?.settings?.data?.list || compRes?.data?.list || [];
          setCompanyOptions(
            compData.map((c) => ({ label: c.companyName, value: c.id }))
          );
        } catch (error) {
          console.error("Failed to load company options", error);
        }
      };
      loadOptions();
    }
  }, [user]);

  useEffect(() => {
    const effectiveCompanyId = user?.isSuperAdmin ? formData.companyId : (user?.companyId || null);

    if (effectiveCompanyId) {
      const loadWorkCentres = async () => {
        try {
          const filters = [{ key: "companyId", value: effectiveCompanyId, operator: "equal" }];
          const wcRes = await listWorkCentres({ page: 1, limit: 1000, filters });
          const wcData = wcRes?.settings?.data?.list || wcRes?.data?.list || [];
          setWorkCentreOptions(
            wcData.map((w) => ({ label: w.workCentreName, value: w.id }))
          );
        } catch (error) {
          console.error("Failed to load work centre options", error);
        }
      };
      loadWorkCentres();

      if (mode === "create" && prevCompanyId && prevCompanyId !== effectiveCompanyId) {
        setFormData(prev => ({ ...prev, workCentreId: "" }));
      }
      setPrevCompanyId(effectiveCompanyId);
    } else {
      setWorkCentreOptions([]);
      setPrevCompanyId(null);
    }
  }, [formData.companyId, user, mode, prevCompanyId]);

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
        title:
          mode === "create"
            ? `Add ${processConfig.title}`
            : `Edit ${processConfig.title}`,
        breadcrumbs: [
          { label:  "Master" },
          { label: "Process Master", href: buildRoute("process", "list") },
          { label: mode === "create" ? "Add" : "Edit" },
        ],
      },
    });
    return () => resetConfig();
  }, [mode]);

  const requiredPermission =
    mode === "create"
      ? processConfig.actions?.createPermission || processConfig.actions?.header?.[0]?.permission
      : processConfig.actions?.updatePermission || processConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleNameChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (mode === "create" && name === "processName") {
        const generatedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
        nextData.processCode = generatedCode;
      }
      return nextData;
    });

    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        if (mode === "create" && name === "processName" && copy.processCode) {
          delete copy.processCode;
        }
        return copy;
      });
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (name === "companyId" && mode === "create") {
        nextData.workCentreId = "";
      }
      return nextData;
    });
    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Valid extensions : png, jpg, jpeg, webp.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Valid size : Less than (<) 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsDirty(true);
    
    setIsImageUploading(true);
    setImageUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setImageUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsImageUploading(false);
      }
    }, 200);
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Valid extension : pdf.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Valid size : Less than (<) 100 MB.");
      return;
    }
    setPdfFile(file);
    setPdfPreview(file.name);
    setIsDirty(true);
    
    setIsPdfUploading(true);
    setPdfUploadProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setPdfUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsPdfUploading(false);
      }
    }, 200);
  };

  const cancelImageUpload = () => {
    setIsImageUploading(false);
    setImageUploadProgress(0);
    removeImage();
  };

  const cancelPdfUpload = () => {
    setIsPdfUploading(false);
    setPdfUploadProgress(0);
    removePdf();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const imageInput = document.getElementById("process-form-image-input");
    if (imageInput) imageInput.value = "";
    setIsDirty(true);
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfPreview(null);
    const pdfInput = document.getElementById("process-form-pdf-input");
    if (pdfInput) pdfInput.value = "";
    setIsDirty(true);
  };

  const confirmRemoveImage = () => {
    removeImage();
    setIsDeleteImageModalOpen(false);
  };

  const confirmRemovePdf = () => {
    removePdf();
    setIsDeletePdfModalOpen(false);
  };

  const validateForm = () => {
    const schema = getProcessSchema(user?.isSuperAdmin);
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

  const handleCancelClick = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.push(buildRoute("process", "list"));
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = { ...(mode === "edit" ? { ...data, id: Number(id) } : data) };
      
      if (payload.processName) payload.processName = payload.processName.trim();
      if (payload.processCode) payload.processCode = payload.processCode.trim();
      if (payload.workCentreId) payload.workCentreId = Number(payload.workCentreId);
      
      delete payload.imageUrl;
      if (imageFile) {
        delete payload.imageUrl;
      } else if (!imagePreview) {
        payload.imageUrl = "";
      }

      delete payload.instructionPdfUrl;
      if (pdfFile) {
        delete payload.instructionPdfUrl;
      } else if (!pdfPreview) {
        payload.instructionPdfUrl = "";
      }

      if (!user?.isSuperAdmin) {
        payload.companyId = user?.companyId || initialData?.companyId;
      }

      if (payload.companyId) {
        payload.companyId = Number(payload.companyId);
      }

      const response = mode === "create"
        ? await createProcess(payload, imageFile || null, pdfFile || null)
        : await updateProcess(payload, imageFile || null, pdfFile || null);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      let message = response?.message || response?.settings?.message;
      if (Array.isArray(message)) message = message.join(", ");

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Process created successfully!"
            : "Process updated successfully!"
        );
        router.push(buildRoute("process", "list"));
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} process`);
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 h-full overflow-y-auto pb-20 mx-6">
      <form onSubmit={handleFormSubmit} className="space-y-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
              Process Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-3">
                Process Image
              </label>

              <div
                className="relative border-2 border-dashed border-[#1565c0] rounded-md p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition w-full"
                onClick={() =>
                  !isImageUploading &&
                  document.getElementById("process-form-image-input")?.click()
                }
              >
                <span className="text-gray-500 text-sm">Choose File</span>
                <div
                  className="relative group flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info size={20} className="text-gray-500 cursor-pointer" />
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                    Valid extensions : png, jpg, jpeg, webp.
                    <br />
                    Valid size : Less than (&lt;) 5 MB.
                  </div>
                </div>
              </div>

              {isImageUploading && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 max-w-[120px]">
                    <div className="h-[22px] w-full bg-[#e0e0e0] overflow-hidden flex items-center">
                      <div
                        className="h-full bg-[#1565c0] transition-all duration-200 flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ width: `${imageUploadProgress}%` }}
                      >
                        {imageUploadProgress > 20 && `${imageUploadProgress}%`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelImageUpload();
                    }}
                    className="text-[#1565c0] text-[13px] font-medium hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {!isImageUploading && imagePreview && (
                <div className="mt-4 relative inline-block self-start">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-[84px] h-[64px] object-cover rounded border border-gray-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDeleteImageModalOpen(true);
                    }}
                    className="absolute -top-2.5 -right-2.5 bg-gray-400 text-white rounded-full p-0.5 hover:bg-gray-600 transition shadow-md z-10 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <input
                id="process-form-image-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-3">
                Instruction PDF
              </label>

              <div
                className="relative border-2 border-dashed border-[#1565c0] rounded-md p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition w-full"
                onClick={() =>
                  !isPdfUploading &&
                  document.getElementById("process-form-pdf-input")?.click()
                }
              >
                <span className="text-gray-500 text-sm">Choose File</span>
                <div
                  className="relative group flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info size={20} className="text-gray-500 cursor-pointer" />
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                    Valid extension : pdf.
                    <br />
                    Valid size : Less than (&lt;) 100 MB.
                  </div>
                </div>
              </div>

              {isPdfUploading && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 max-w-[120px]">
                    <div className="h-[22px] w-full bg-[#e0e0e0] overflow-hidden flex items-center">
                      <div
                        className="h-full bg-[#1565c0] transition-all duration-200 flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ width: `${pdfUploadProgress}%` }}
                      >
                        {pdfUploadProgress > 20 && `${pdfUploadProgress}%`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelPdfUpload();
                    }}
                    className="text-[#1565c0] text-[13px] font-medium hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {!isPdfUploading && pdfPreview && (
                <div className="mt-4 relative inline-block self-start bg-gray-100 p-3 rounded border border-gray-300 shadow-sm pr-10 min-w-[120px] max-w-[250px]">
                  <div className="flex items-center gap-2">
                    <FileText
                      size={20}
                      className="text-gray-500 flex-shrink-0"
                    />
                    <span
                      className="text-sm text-gray-700 truncate"
                      title={pdfPreview.split("/").pop() || "Document.pdf"}
                    >
                      {pdfPreview.split("/").pop() || "Document.pdf"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDeletePdfModalOpen(true);
                    }}
                    className="absolute -top-2.5 -right-2.5 bg-gray-400 text-white rounded-full p-0.5 hover:bg-gray-600 transition shadow-md z-10 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <input
                id="process-form-pdf-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfChange}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Process Name <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Process Name"
                value={formData.processName || ""}
                onChange={(e) =>
                  handleNameChange("processName", e.target.value)
                }
                className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-sm placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.processName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                `}
              />
              {errors.processName && (
                <p className="text-xs text-red-500">{errors.processName}</p>
              )}
            </div>

            {user?.isSuperAdmin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                  Company <span className="text-red-400 ml-1">*</span>
                </label>
                <Select
                  instanceId="select-company"
                  value={
                    companyOptions.find(
                      (c) => c.value === formData.companyId,
                    ) || null
                  }
                  onChange={(opt) =>
                    handleChange("companyId", opt ? opt.value : "")
                  }
                  options={companyOptions}
                  isDisabled={mode === "edit"}
                  isClearable={true}
                  isSearchable={true}
                  placeholder="Select Company"
                  classNamePrefix="react-select"
                  styles={customSelectStyles(errors.companyId, mode === "edit")}
                />
                {errors.companyId && (
                  <p className="text-xs text-red-500">{errors.companyId}</p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Process Code <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                disabled={mode === "edit"}
                placeholder="Enter Process Code"
                value={formData.processCode || ""}
                onChange={(e) => handleChange("processCode", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-sm placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                  ${errors.processCode ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  ${mode === "edit" ? "cursor-not-allowed bg-gray-100 text-gray-400" : "bg-white"}
                `}
              />
              {errors.processCode && (
                <p className="text-xs text-red-500">{errors.processCode}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Work Centre <span className="text-red-400 ml-1">*</span>
              </label>
              <Select
                instanceId="select-work-centre"
                value={
                  workCentreOptions.find(
                    (c) => c.value === formData.workCentreId,
                  ) || null
                }
                onChange={(opt) =>
                  handleChange("workCentreId", opt ? opt.value : "")
                }
                options={workCentreOptions}
                isClearable={true}
                isSearchable={true}
                placeholder="Select Work Centre"
                noOptionsMessage={() =>
                  user?.isSuperAdmin && !formData.companyId
                    ? "Please select Company."
                    : "No work centres found for this company"
                }
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.workCentreId)}
              />
              {errors.workCentreId && (
                <p className="text-xs text-red-500">{errors.workCentreId}</p>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Description
              </label>
              <textarea
                placeholder="Enter Description"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm placeholder:text-sm placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.description ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                `}
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Status <span className="text-red-400 ml-1">*</span>
              </label>
              <Select
                instanceId="select-status"
                value={
                  STATUS_OPTIONS.find((s) => s.value === formData.status) ||
                  null
                }
                onChange={(opt) => handleChange("status", opt ? opt.value : "")}
                options={STATUS_OPTIONS}
                isClearable={true}
                isSearchable={false}
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

        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        actionType={
          confirmState.type === "discard"
            ? "discard"
            : mode === "create"
              ? "create"
              : "update"
        }
        entityName="Process"
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            router.push(buildRoute("process", "list"));
          }
          setConfirmState({ isOpen: false, type: null, data: null });
        }}
        onCancel={() =>
          setConfirmState({ isOpen: false, type: null, data: null })
        }
      />

      <DeleteConfirmModal
        isOpen={isDeleteImageModalOpen}
        title="Delete"
        message="Are you sure want to delete this?"
        onConfirm={confirmRemoveImage}
        onCancel={() => setIsDeleteImageModalOpen(false)}
      />

      <DeleteConfirmModal
        isOpen={isDeletePdfModalOpen}
        title="Delete"
        message="Are you sure want to delete this PDF?"
        onConfirm={confirmRemovePdf}
        onCancel={() => setIsDeletePdfModalOpen(false)}
      />
    </div>
  );
}
