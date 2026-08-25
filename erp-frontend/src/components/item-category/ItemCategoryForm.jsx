"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { createItemCategory, updateItemCategory, listItemCategories } from "@/lib/api/item-category-api";
import { listCompanies } from "@/lib/api/company-api";
import { listStorages } from "@/lib/api/storage-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import itemCategoryConfig from "@/config/item-category.config.json";
import { getItemCategorySchema } from "@/lib/validation/item-category.schema";
import MultiSelectWithToggle from "@/components/common/form/MultiSelectWithToggle";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const BASE_DEFAULTS = {
  categoryName: "",
  categoryCode: "",
  referenceCode: "",
  parentId: null,
  storageIds: [],
  status: "Active",
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
  dropdownIndicator: (base, state) => ({
    ...base,
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  }),
});

export default function ItemCategoryForm({
  mode = "create",
  initialData = null,
  id = null,
}) {
  const router = useRouter();
  const { can, user } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  
  const [loading, setLoading] = useState(false);
  const [loadingDependentFields, setLoadingDependentFields] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);
  
  const [storageOptions, setStorageOptions] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);

  const defaultValues = { ...BASE_DEFAULTS, ...initialData };

  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  const [prevCompanyId, setPrevCompanyId] = useState(formData.companyId);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
      setPrevCompanyId(initialData.companyId);
    }
  }, [initialData]);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      const loadOptions = async () => {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const compData =
            compRes?.settings?.data?.list || compRes?.data?.list || [];
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
      const fetchDependent = async () => {
        try {
          setLoadingDependentFields(true);
          const filters = [{ key: "companyId", value: effectiveCompanyId, operator: "equal" }];
          
          const [storageRes, catRes] = await Promise.all([
            listStorages({ page: 1, limit: 1000, filters }),
            listItemCategories({ page: 1, limit: 1000, filters })
          ]);
          
          const storages = storageRes?.settings?.data?.list || storageRes?.data?.list || [];
          setStorageOptions(storages.map(s => ({ label: s.storageName, value: s.id })));
          
          const cats = catRes?.settings?.data?.list || catRes?.data?.list || [];
          const filteredCats = mode === "edit" ? cats.filter(c => c.id !== Number(id)) : cats;
          setParentOptions(filteredCats.map(c => ({ label: c.categoryName, value: c.id })));
          
        } catch (error) {
          console.error("Failed to load dependent options", error);
        } finally {
          setLoadingDependentFields(false);
        }
      };
      fetchDependent();
      
      if (mode === "create" && prevCompanyId && prevCompanyId !== effectiveCompanyId) {
        setFormData(prev => ({ ...prev, storageIds: [], parentId: null }));
      }
      setPrevCompanyId(effectiveCompanyId);
      
    } else {
      setStorageOptions([]);
      setParentOptions([]);
      setPrevCompanyId(null);
    }
  }, [formData.companyId, user, mode, id, prevCompanyId]);

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
        title: `${mode === "create" ? "Add" : "Edit"} Item Category`,
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: itemCategoryConfig.title, href: "/item-category" },
          {
            label: `${mode === "create" ? "Add" : "Edit"} Category`,
          },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, mode]);

  const requiredPermission =
    mode === "create"
      ? itemCategoryConfig.actions?.createPermission ||
      itemCategoryConfig.actions?.header?.[0]?.permission
      : itemCategoryConfig.actions?.updatePermission ||
      itemCategoryConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };

      if (mode === "create" && name === "categoryName") {
        const generatedCode = value.toUpperCase().replace(/\s+/g, "_");
        nextData.categoryCode = generatedCode;
      }
      
      if (mode === "create" && name === "companyId") {
        nextData.parentId = null;
        nextData.storageIds = [];
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

  const validateForm = () => {
    const schema = getItemCategorySchema(user?.isSuperAdmin);
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
      router.push("/item-category");
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = mode === "edit" ? { ...data, id: Number(id) } : data;
      
      if (!user?.isSuperAdmin) {
        payload.companyId = user?.companyId || initialData?.companyId;
      }

      const response =
        mode === "create"
          ? await createItemCategory(payload)
          : await updateItemCategory(payload);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Category created successfully!"
            : "Category updated successfully!"
        );
        router.push("/item-category");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} category`);
      }
    } catch (error) {
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
              Category Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Category Name <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.categoryName || ""}
                onChange={(e) => handleChange("categoryName", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.categoryName ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  `}
              />
              {errors.categoryName && (
                <p className="text-xs text-red-500">{errors.categoryName}</p>
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
                    companyOptions.find((c) => c.value === formData.companyId) ||
                    null
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
                Category Code <span className="text-red-400 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.categoryCode || ""}
                onChange={(e) => handleChange("categoryCode", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                        ${errors.categoryCode ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                        bg-white
                      `}
              />
              {errors.categoryCode && (
                <p className="text-xs text-red-500">{errors.categoryCode}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Reference Code
              </label>
              <input
                type="text"
                value={formData.referenceCode || ""}
                onChange={(e) => handleChange("referenceCode", e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  ${errors.referenceCode ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                  `}
              />
              {errors.referenceCode && (
                <p className="text-xs text-red-500">{errors.referenceCode}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Parent Category
              </label>
              <Select
                instanceId="select-parent"
                value={
                  parentOptions.find((c) => c.value === formData.parentId) ||
                  null
                }
                onChange={(opt) => handleChange("parentId", opt ? opt.value : null)}
                options={parentOptions}
                isLoading={loadingDependentFields}
                isClearable={true}
                isSearchable={true}
                placeholder="Select Parent Category"
                noOptionsMessage={() => 
                  (user?.isSuperAdmin && !formData.companyId) 
                    ? "⚠ Please select Company." 
                    : "No parent categories found for this company"
                }
                classNamePrefix="react-select"
                styles={customSelectStyles(errors.parentId)}
              />
              {errors.parentId && (
                <p className="text-xs text-red-500">{errors.parentId}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Category Storage Mapping
              </label>
              <MultiSelectWithToggle
                instanceId="select-storages"
                value={formData.storageIds || []}
                onChange={(val) => handleChange("storageIds", val)}
                options={storageOptions}
                isLoading={loadingDependentFields}
                placeholder="Select Storages"
                noOptionsMessage={() => 
                  (user?.isSuperAdmin && !formData.companyId) 
                    ? "⚠ Please select Company." 
                    : "No storages found for this company"
                }
                error={errors.storageIds}
              />
              {errors.storageIds && (
                <p className="text-xs text-red-500">{errors.storageIds}</p>
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
            {loading
              ? "Saving..."
              : "Submit"}
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
            ? "Are you sure you want to save this category?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            router.push("/item-category");
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
