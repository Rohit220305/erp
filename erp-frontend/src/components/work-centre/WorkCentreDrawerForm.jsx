"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { createWorkCentre, updateWorkCentre } from "@/lib/api/work-centre-api";
import { listCompanies } from "@/lib/api/company-api";
import { listWorkCentreCategories } from "@/lib/api/work-centre-category-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import workCentreConfig from "@/config/work-centre.config.json";
import { getWorkCentreSchema } from "@/lib/validation/work-centre.schema";
import { X, Info } from "lucide-react";


const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const USAGE_STATUS_OPTIONS = [
  { label: "Available", value: "Available" },
  { label: "Inuse", value: "Inuse" },
  { label: "Maintenance", value: "Maintenance" },
];

const BASE_DEFAULTS = {
  workCentreCode: "",
  workCentreName: "",
  categoryId: "",
  usageStatus: "Available",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f3f4f6" : "#f9fafb",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#1565c0",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#1565c0"
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
});

export default function WorkCentreDrawerForm({
  mode = "create",
  initialData = null,
  id = null,
  onSuccess = null,
  onClose = null,
  open = true,
}) {
  const { can, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const defaultValues = { ...BASE_DEFAULTS, ...initialData };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDeleteImageModalOpen, setIsDeleteImageModalOpen] = useState(false);
  const [prevCompanyId, setPrevCompanyId] = useState(formData.companyId);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({ ...BASE_DEFAULTS, ...initialData });
        setImagePreview(initialData.imageUrl || null);
        setPrevCompanyId(initialData.companyId);
      } else {
        setFormData(BASE_DEFAULTS);
        setImagePreview(null);
        setPrevCompanyId(null);
      }
      setImageFile(null);
      setErrors({});
      setIsDirty(false);
      setIsUploading(false);
      setUploadProgress(0);
      setIsDeleteImageModalOpen(false);
    }
  }, [initialData, open]);

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
      const loadCategories = async () => {
        try {
          const filters = [{ key: "companyId", value: effectiveCompanyId, operator: "equal" }];
          const catRes = await listWorkCentreCategories({ page: 1, limit: 1000, filters });
          const catData = catRes?.settings?.data?.list || catRes?.data?.list || [];
          setCategoryOptions(
            catData.map((c) => ({ label: c.categoryName, value: c.id }))
          );
        } catch (error) {
          console.error("Failed to load category options", error);
        }
      };
      loadCategories();

      if (mode === "create" && prevCompanyId && prevCompanyId !== effectiveCompanyId) {
        setFormData(prev => ({ ...prev, categoryId: "" }));
      }
      setPrevCompanyId(effectiveCompanyId);
    } else {
      setCategoryOptions([]);
      setPrevCompanyId(null);
    }
  }, [formData.companyId, user, mode, prevCompanyId]);

  const requiredPermission =
    mode === "create"
      ? workCentreConfig.actions?.createPermission || workCentreConfig.actions?.header?.[0]?.permission
      : workCentreConfig.actions?.updatePermission || workCentreConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleNameChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };

      if (mode === "create" && name === "workCentreName") {
        const generatedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
        nextData.workCentreCode = generatedCode;
      }
      return nextData;
    });

    setIsDirty(true);

    if (errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        if (mode === "create" && name === "workCentreName" && copy.workCentreCode) {
          delete copy.workCentreCode;
        }
        return copy;
      });
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (name === "companyId" && mode === "create") {
        nextData.categoryId = "";
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
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/x-icon"].includes(file.type)) {
      toast.error("Valid extensions : gif, png, jpg, jpeg, jpe, bmp, ico.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Valid size : Less than (<) 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsDirty(true);

    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 200);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    removeImage();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById("work-centre-drawer-file-input");
    if (fileInput) fileInput.value = "";
    setIsDirty(true);
  };

  const confirmRemoveImage = () => {
    removeImage();
    setIsDeleteImageModalOpen(false);
  };

  const validateForm = () => {
    const schema = getWorkCentreSchema(user?.isSuperAdmin);
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
      onClose && onClose();
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = { ...(mode === "edit" ? { ...data, id: Number(id) } : data) };

      if (payload.workCentreName) payload.workCentreName = payload.workCentreName.trim();
      if (payload.workCentreCode) payload.workCentreCode = payload.workCentreCode.trim();
      if (payload.categoryId) payload.categoryId = Number(payload.categoryId);

      if (imageFile) {
      } else if (!imagePreview) {
        payload.imageUrl = "";
      } else {
        delete payload.imageUrl;
      }

      if (!user?.isSuperAdmin) {
        payload.companyId = user?.companyId || initialData?.companyId;
      }

      if (payload.companyId) {
        payload.companyId = Number(payload.companyId);
      }

      const response = mode === "create"
        ? await createWorkCentre(payload, imageFile || null)
        : await updateWorkCentre(payload, imageFile || null);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      let message = response?.message || response?.settings?.message;
      if (Array.isArray(message)) message = message.join(", ");

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Work Centre created successfully!"
            : "Work Centre updated successfully!"
        );
        onSuccess && onSuccess();
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} work centre`);
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col text-black">
      <form onSubmit={handleFormSubmit} id="drawer-form" className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6">

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Work Centre Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.workCentreName || ""}
              onChange={(e) => handleNameChange("workCentreName", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none transition focus:bg-white focus:border-[#1565c0]
                ${errors.workCentreName ? "border-red-500 bg-red-50" : "border-gray-300"}
              `}
            />
            {errors.workCentreName && (
              <p className="mt-1 text-sm text-red-500">{errors.workCentreName}</p>
            )}
          </div>

          {user?.isSuperAdmin && (
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company <span className="text-red-500">*</span>
              </label>
              <Select
                instanceId="select-company"
                value={companyOptions.find((c) => c.value === formData.companyId) || null}
                onChange={(opt) => handleChange("companyId", opt ? opt.value : "")}
                options={companyOptions}
                isDisabled={mode === "edit"}
                isClearable={true}
                isSearchable={true}
                placeholder="Select Company"
                classNamePrefix="react-select"
                maxMenuHeight={200}
                menuPosition="fixed"
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                styles={{ ...customSelectStyles(errors.companyId, mode === "edit"), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
              />
              {errors.companyId && (
                <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
              )}
            </div>
          )}

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Work Centre Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              disabled={mode === "edit"}
              value={formData.workCentreCode || ""}
              onChange={(e) => handleChange("workCentreCode", e.target.value)}
              className={`w-full rounded-md border bg-gray-50 px-4 py-3 outline-none transition focus:bg-white focus:border-[#1565c0]
                ${errors.workCentreCode ? "border-red-500 bg-red-50" : "border-gray-300"}
                ${mode === "edit" ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}
              `}
            />
            {errors.workCentreCode && (
              <p className="mt-1 text-sm text-red-500">{errors.workCentreCode}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Work Centre Image
            </label>

            <div
              className="relative border-2 border-dashed border-[#1565c0] rounded-md p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition"
              onClick={() => !isUploading && document.getElementById("work-centre-drawer-file-input")?.click()}
            >
              <span className="text-gray-500 text-sm">Choose File</span>
              <div className="relative group flex items-center" onClick={e => e.stopPropagation()}>
                <Info size={20} className="text-gray-500 cursor-pointer" />
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                  <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                  Valid extensions : gif, png, jpg, jpeg, jpe, bmp, ico.<br />
                  Valid size : Less than (&lt;) 5 MB.
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1 max-w-[120px]">
                  <div className="h-[22px] w-full bg-[#e0e0e0] overflow-hidden flex items-center">
                    <div className="h-full bg-[#1565c0] transition-all duration-200 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${uploadProgress}%` }}>
                      {uploadProgress > 20 && `${uploadProgress}%`}
                    </div>
                  </div>
                </div>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); cancelUpload(); }} className="text-[#1565c0] text-[13px] font-medium hover:underline cursor-pointer">Cancel</button>
              </div>
            )}

            {!isUploading && imagePreview && (
              <div className="mt-4 relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-[84px] h-[64px] object-cover rounded border border-gray-300 shadow-sm" />
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsDeleteImageModalOpen(true); }}
                  className="absolute -top-2.5 -right-2.5 bg-gray-400 text-white rounded-full p-0.5 hover:bg-gray-600 transition shadow-md z-10 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <input
              id="work-centre-drawer-file-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/x-icon"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              instanceId="select-category"
              value={categoryOptions.find((c) => c.value === formData.categoryId) || null}
              onChange={(opt) => handleChange("categoryId", opt ? opt.value : "")}
              options={categoryOptions}
              isClearable={true}
              isSearchable={true}
              placeholder="Select Category"
              noOptionsMessage={() =>
                (user?.isSuperAdmin && !formData.companyId)
                  ? "⚠ Please select Company."
                  : "No categories found for this company"
              }
              classNamePrefix="react-select"
              maxMenuHeight={200}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : null}
              styles={{ ...customSelectStyles(errors.categoryId), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Usage Status <span className="text-red-500">*</span>
            </label>
            <Select
              instanceId="select-usage-status"
              value={USAGE_STATUS_OPTIONS.find((s) => s.value === formData.usageStatus) || null}
              onChange={(opt) => handleChange("usageStatus", opt ? opt.value : "")}
              options={USAGE_STATUS_OPTIONS}
              isClearable={true}
              isSearchable={false}
              placeholder="Select Usage Status"
              classNamePrefix="react-select"
              maxMenuHeight={200}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : null}
              styles={{ ...customSelectStyles(errors.usageStatus), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
            {errors.usageStatus && (
              <p className="mt-1 text-sm text-red-500">{errors.usageStatus}</p>
            )}
          </div>

          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-gray-700">
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
              maxMenuHeight={200}
              menuPosition="fixed"
              menuPortalTarget={typeof window !== "undefined" ? document.body : null}
              styles={{ ...customSelectStyles(errors.status), menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status}</p>
            )}
          </div>

        </div>

        <div className="border-t bg-white px-6 pt-5 pb-10">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md border border-[#1565c0] px-4 py-3 text-[#1565c0] transition hover:bg-blue-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md bg-[#1565c0] px-4 py-3 text-white transition hover:bg-[#0f57a6] disabled:opacity-50"
            >
              {loading ? "Saving..." : mode === "create" ? "Save" : "Update"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === "submit" ? "Confirm Submission" : "Discard Changes"}
        message={
          confirmState.type === "submit"
            ? "Are you sure you want to save this work centre?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            onClose && onClose();
          }
          setConfirmState({ isOpen: false, type: null, data: null });
        }}
        onCancel={() => setConfirmState({ isOpen: false, type: null, data: null })}
      />

      {isDeleteImageModalOpen && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" onClick={() => setIsDeleteImageModalOpen(false)}></div>
          <div className="relative bg-[#f0f0f0] w-72 shadow-2xl z-10 flex flex-col border border-gray-200">
            <div className="bg-[#1565c0] flex justify-between items-center px-4 py-2.5 text-white">
              <span className="text-sm font-semibold tracking-wide">Delete</span>
              <X size={16} className="cursor-pointer hover:text-gray-200" onClick={() => setIsDeleteImageModalOpen(false)} />
            </div>
            <div className="p-5 text-sm text-gray-700">
              Are you sure want to delete this?
            </div>
            <div className="p-4 pt-1 flex justify-center gap-3">
              <button type="button" onClick={confirmRemoveImage} className="bg-[#1565c0] hover:bg-[#0f57a6] text-white px-5 py-2 text-sm rounded transition cursor-pointer">Delete</button>
              <button type="button" onClick={() => setIsDeleteImageModalOpen(false)} className="bg-[#1565c0] hover:bg-[#0f57a6] text-white px-5 py-2 text-sm rounded transition cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
