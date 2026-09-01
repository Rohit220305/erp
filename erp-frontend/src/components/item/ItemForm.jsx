"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { useRouter } from "next/navigation";
import { createItem, updateItem } from "@/lib/api/item-api";
import { listCompanies, getCompany } from "@/lib/api/company-api";
import { listItemCategories } from "@/lib/api/item-category-api";
import { listManufacturers } from "@/lib/api/manufacturer-api";
import { listBrands } from "@/lib/api/brand-api";
import { listItemUoms } from "@/lib/api/item-uom-api";
import { listPackages } from "@/lib/api/package-master-api";
import { listCurrencies } from "@/lib/api/currency-api";
import { listStorages } from "@/lib/api/storage-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import Loader from "@/components/common/Loader";
import itemConfig from "@/config/item.config.json";
import { getItemSchema } from "@/lib/validation/item.schema";
import { X, Info, Star, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const USAGE_TYPE_OPTIONS = [
  { label: "Finished (Tradable)", value: "finished_tradable" },
  { label: "Consumable (Non-Tradable)", value: "consumable_non_tradable" },
  { label: "Work In Progress (Non-Tradable)", value: "wip_non_tradable" },
  { label: "Non-Consumable (Asset/Capital)", value: "non_consumable_asset" },
];

const INVENTORY_TYPE_OPTIONS = [
  { label: "Bulk", value: "bulk" },
  { label: "Discrete", value: "discrete" },
];

const SHELF_LIFE_UNIT_OPTIONS = [
  { label: "Minute", value: "minute" },
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
];

const BASE_DEFAULTS = {
  itemName: "",
  itemCode: "",
  shortName: "",
  printName: "",
  referenceCode: "",
  barcode: "",
  vendorBarcode: "",
  usageType: "finished_tradable",
  companyId: "",
  categoryId: "",
  manufacturerId: "",
  brandId: "",
  inventoryType: "bulk",
  isDecimalAllowed: "No",
  itemUomId: "",
  packageUomId: "",
  unitsPerPacking: "",
  primitiveQuantity: "",
  currencyCode: "",
  purchasePrice: "",
  costPrice: "",
  costPerUnit: "",
  weight: "",
  weightUomId: "",
  volume: "",
  volumeUomId: "",
  length: "",
  width: "",
  height: "",
  dimensionUomId: "",
  storageId: "",
  shelfLife: "",
  shelfLifeUnit: "month",
  batchCode: "",
  isScrap: "No",
  description: "",
  remark: "",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.5rem",
    minHeight: "56px",
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
  }),
});

export default function ItemForm({
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
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [manufacturerOptions, setManufacturerOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);

  const defaultValues = { ...BASE_DEFAULTS, ...initialData };
  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState(
    initialData?.itemImages || [],
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [prevCompanyId, setPrevCompanyId] = useState(formData.companyId);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });
  const [imageToDelete, setImageToDelete] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
      setPrevCompanyId(initialData.companyId);
      setExistingImages(initialData.images || initialData.itemImages || []);
    }
  }, [initialData]);

  useEffect(() => {
    const loadGlobalOptions = async () => {
    };
    loadGlobalOptions();

    if (user?.isSuperAdmin) {
      const loadCompanies = async () => {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const compData =
            compRes?.settings?.data?.list || compRes?.data?.list || [];
          setCompanyOptions(
            compData.map((c) => ({ label: c.companyName, value: c.id })),
          );
        } catch (error) {
          console.error("Failed to load company options", error);
        }
      };
      loadCompanies();
    }
  }, [user]);

  useEffect(() => {
    const effectiveCompanyId = user?.isSuperAdmin
      ? formData.companyId
      : user?.companyId || null;

    if (effectiveCompanyId) {
      const fetchDependent = async () => {
        try {
          setLoadingDependentFields(true);
          const filters = [
            { key: "companyId", value: effectiveCompanyId, operator: "equal" },
          ];

          const [catRes, manRes, pkgRes, uomRes, compRes, storageRes] =
            await Promise.all([
              listItemCategories({ page: 1, limit: 1000, filters }),
              listManufacturers({ page: 1, limit: 1000, filters }),
              listPackages({ page: 1, limit: 1000, filters }),
              listItemUoms({ page: 1, limit: 1000, filters }),
              getCompany(effectiveCompanyId),
              listStorages({ page: 1, limit: 1000, filters }),
            ]);

          const cats = catRes?.settings?.data?.list || catRes?.data?.list || [];
          setCategoryOptions(
            cats.map((c) => ({ label: c.categoryName, value: c.id })),
          );

          const mans = manRes?.settings?.data?.list || manRes?.data?.list || [];
          setManufacturerOptions(
            mans.map((m) => ({ label: m.manufacturerName, value: m.id })),
          );

          const pkgs = pkgRes?.settings?.data?.list || pkgRes?.data?.list || [];
          setPackageOptions(
            pkgs.map((p) => ({ label: p.packageName, value: p.id })),
          );

          const uoms = uomRes?.settings?.data?.list || uomRes?.data?.list || [];
          setUomOptions(uoms.map((u) => ({ label: u.uomName, value: u.id })));

          const currencies = compRes?.currencies || [];
          setCurrencyOptions(
            currencies.map((c) => ({
              label: `${c.currencyCode} - ${c.currencyName}`,
              value: c.currencyCode,
            })),
          );
          
          setFormData((prev) => {
            if (!prev.currencyCode && currencies.length > 0) {
              return { ...prev, currencyCode: currencies[0].currencyCode };
            }
            return prev;
          });

          const storages = storageRes?.settings?.data?.list || storageRes?.data?.list || [];
          setStorageOptions(
            storages.map((s) => ({ label: s.storageName, value: s.id }))
          );
        } catch (error) {
          console.error("Failed to load dependent options", error);
        } finally {
          setLoadingDependentFields(false);
        }
      };
      fetchDependent();

      if (
        mode === "create" &&
        prevCompanyId &&
        prevCompanyId !== effectiveCompanyId
      ) {
        setFormData((prev) => ({
          ...prev,
          categoryId: "",
          manufacturerId: "",
          brandId: "",
          packageUomId: "",
          itemUomId: "",
          weightUomId: "",
          volumeUomId: "",
          dimensionUomId: "",
          currencyCode: "",
          storageId: "",
        }));
      }
      setPrevCompanyId(effectiveCompanyId);
    } else {
      setCategoryOptions([]);
      setManufacturerOptions([]);
      setBrandOptions([]);
      setPackageOptions([]);
      setUomOptions([]);
      setCurrencyOptions([]);
      setStorageOptions([]);
      setPrevCompanyId(null);
    }
  }, [formData.companyId, user, mode, prevCompanyId]);

  useEffect(() => {
    const effectiveCompanyId = user?.isSuperAdmin
      ? formData.companyId
      : user?.companyId || null;

    if (effectiveCompanyId && formData.manufacturerId) {
      const fetchBrands = async () => {
        try {
          const filters = [
            { key: "companyId", value: effectiveCompanyId, operator: "equal" },
            { key: "manufacturerId", value: formData.manufacturerId, operator: "equal" },
          ];
          const brandRes = await listBrands({ page: 1, limit: 1000, filters });
          const brands = brandRes?.settings?.data?.list || brandRes?.data?.list || [];
          setBrandOptions(brands.map((b) => ({ label: b.brandName, value: b.id })));
        } catch (error) {
          console.error("Failed to load brands", error);
        }
      };
      fetchBrands();
    } else {
      setBrandOptions([]);
    }
  }, [formData.companyId, formData.manufacturerId, user]);

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
            ? `Add ${itemConfig.title}`
            : `Edit ${itemConfig.title}`,
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: itemConfig.title, href: "/item" },
          { label: mode === "create" ? "Add" : "Edit" },
        ],
      },
    });
    return () => resetConfig();
  }, [mode]);

  const requiredPermission =
    mode === "create"
      ? itemConfig.actions?.createPermission ||
        itemConfig.actions?.header?.[0]?.permission
      : itemConfig.actions?.updatePermission ||
        itemConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (mode === "create" && name === "itemName") {
        const generatedCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "_");
        nextData.itemCode = generatedCode;
      }
      if (name === "manufacturerId") {
        nextData.brandId = "";
      }
      return nextData;
    });
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        if (mode === "create" && name === "itemName" && copy.itemCode) {
          delete copy.itemCode;
        }
        return copy;
      });
    }
  };

  const generateBarcode = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const random = Math.floor(100 + Math.random() * 900).toString();
    const newBarcode = timestamp + random;
    setFormData((prev) => ({ ...prev, barcode: newBarcode }));
    setIsDirty(true);
    if (errors.barcode) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.barcode;
        return copy;
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isValidExt = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024;
      if (!isValidExt) toast.error(`Invalid extension for ${file.name}`);
      if (!isValidSize) toast.error(`${file.name} is larger than 5 MB`);
      return isValidExt && isValidSize;
    });

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((f) => URL.createObjectURL(f));

      setIsUploading(true);
      setUploadProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setImageFiles((prev) => [...prev, ...validFiles]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
          setIsDirty(true);
          setIsUploading(false);
        }
      }, 200);
    }

    const imageInput = document.getElementById("item-form-image-input");
    if (imageInput) {
      imageInput.value = "";
    }
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setImageFiles([]);
    setImagePreviews([]);
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const validateForm = () => {
    const schema = getItemSchema(user?.isSuperAdmin);
    const dataToValidate = { ...formData };
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);

      const firstErrorField = Object.keys(fieldErrors)[0];
      const errorElement = document.getElementById(`field-${firstErrorField}`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }
    setErrors({});
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmState({ isOpen: true, type: "submit", data: formData });
    } else {
    }
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.push("/item");
    }
  };

  const handleActualSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = { ...data };
      if (mode === "edit") payload.id = Number(id);
      if (!user?.isSuperAdmin) {
        payload.companyId = user?.companyId || initialData?.companyId;
      }

      const numericFields = [
        "companyId",
        "categoryId",
        "manufacturerId",
        "brandId",
        "itemUomId",
        "packageUomId",
        "weightUomId",
        "volumeUomId",
        "dimensionUomId",
        "unitsPerPacking",
        "primitiveQuantity",
        "purchasePrice",
        "costPrice",
        "costPerUnit",
        "weight",
        "volume",
        "length",
        "width",
        "height",
        "shelfLife",
      ];
      numericFields.forEach((field) => {
        if (
          payload[field] !== "" &&
          payload[field] !== null &&
          payload[field] !== undefined
        ) {
          payload[field] = Number(payload[field]);
        } else {
          delete payload[field];
        }
      });

      const formDataToSend = new FormData();
      Object.entries(payload).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          formDataToSend.append(key, String(val));
        }
      });

      imageFiles.forEach((file) => {
        formDataToSend.append("itemImages", file);
      });

      formDataToSend.append(
        "existingImages",
        JSON.stringify(
          existingImages.map((img, idx) => ({
            id: img.id,
            fileName: img.fileName,
            mimeType: img.mimeType,
            size: img.size,
            isPrimary: idx === 0 ? "Yes" : "No",
            url: img.url || img.fileUrl,
          })),
        ),
      );
      formDataToSend.append("primaryImageIndex", "0");

      
      const response =
        mode === "create"
          ? await createItem(formDataToSend)
          : await updateItem(formDataToSend);

      const isSuccess =
        response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(
          `Item ${mode === "create" ? "created" : "updated"} successfully!`,
        );
        router.push("/item");
      } else {
        toast.error(
          message ||
            `Failed to ${mode === "create" ? "create" : "update"} item`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = ({
    name,
    label,
    type = "text",
    required = false,
    disabled = false,
    readOnly = false,
    ...props
  }) => (
    <div className="space-y-1.5" id={`field-${name}`}>
      <label className="block text-xs font-semibold text-gray-500 tracking-wide">
        {label} {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        value={
          formData[name] === null || formData[name] === undefined
            ? ""
            : formData[name]
        }
        onChange={(e) => handleChange(name, e.target.value)}
        className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
          ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-200 hover:border-gray-300"}
          ${errors[name] ? "border-red-400 bg-red-50" : ""}`}
        placeholder={props.placeholder || `Enter ${label}`}
        {...props}
      />
      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  const renderSelectField = ({
    name,
    label,
    options,
    required = false,
    isLoading = false,
    isDisabled = false,
    companyScoped = false,
    manufacturerScoped = false,
  }) => (
    <div className="space-y-1.5" id={`field-${name}`}>
      <label className="block text-xs font-semibold text-gray-500 tracking-wide">
        {label} {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <Select
        instanceId={`select-${name}`}
        value={
          options.find((opt) => String(opt.value) === String(formData[name])) ||
          null
        }
        onChange={(opt) => handleChange(name, opt ? opt.value : "")}
        options={options}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={true}
        isSearchable={true}
        placeholder={`Select ${label}`}
        noOptionsMessage={() => {
          if (manufacturerScoped && !formData.manufacturerId) {
            return " Please select Manufacturer first.";
          }
          if (companyScoped && user?.isSuperAdmin && !formData.companyId) {
            return " Please select Company.";
          }
          return `No ${label.toLowerCase()} found`;
        }}
        classNamePrefix="react-select"
        styles={customSelectStyles(errors[name], isDisabled)}
      />
      {errors[name] && <p className="text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="pt-6 h-full overflow-y-auto pb-20 mx-6 relative">
      {loading && <Loader overlay />}
      <form onSubmit={handleFormSubmit} className="space-y-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
              Item Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
            {user?.isSuperAdmin &&
              renderSelectField({
                name: "companyId",
                label: "Company",
                options: companyOptions,
                required: true,
                isDisabled: mode === "edit",
              })}
            {user?.isSuperAdmin && <div className="hidden md:block"></div>}

            {renderInputField({
              name: "itemName",
              label: "Item Name",
              required: true,
            })}
            {renderInputField({ name: "shortName", label: "Short Name" })}

            {renderInputField({ name: "printName", label: "Print Name" })}
            {renderInputField({
              name: "itemCode",
              label: "Item Code",
              required: true,
              disabled: mode === "edit",
              readOnly: mode === "edit",
            })}

            {renderSelectField({
              name: "usageType",
              label: "Usage Type",
              options: USAGE_TYPE_OPTIONS,
              required: true,
            })}

            {renderSelectField({
              name: "categoryId",
              label: "Category",
              options: categoryOptions,
              isLoading: loadingDependentFields,
              required: true,
              companyScoped: true,
            })}
            {renderSelectField({
              name: "inventoryType",
              label: "Inventory Type",
              options: INVENTORY_TYPE_OPTIONS,
              required: true,
            })}
            {renderSelectField({
              name: "isDecimalAllowed",
              label: "Is Decimal Allowed?",
              options: YES_NO_OPTIONS,
              required: true,
            })}
            {renderSelectField({
              name: "manufacturerId",
              label: "Manufacturer",
              options: manufacturerOptions,
              isLoading: loadingDependentFields,
              required: true,
              companyScoped: true,
            })}
            {renderSelectField({
              name: "brandId",
              label: "Brand",
              options: brandOptions,
              isLoading: loadingDependentFields,
              required: true,
              companyScoped: true,
              manufacturerScoped: true,
            })}
            {renderInputField({
              name: "referenceCode",
              label: "Reference Code",
            })}
          </div>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 mt-6">
            {renderSelectField({
              name: "packageUomId",
              label: "Package UOM",
              options: packageOptions,
              isLoading: loadingDependentFields,
              required: true,
              companyScoped: true,
            })}
            {renderInputField({
              name: "unitsPerPacking",
              label: "Units Per Packing",
              type: "number",
              step: "0.01",
              required: true,
            })}

            {renderSelectField({
              name: "itemUomId",
              label: "Item UOM",
              options: uomOptions,
              required: true,
              companyScoped: true,
            })}
            {renderInputField({
              name: "primitiveQuantity",
              label: "Primitive Quantity",
              type: "number",
              step: "0.01",
              required: true,
            })}
            {renderSelectField({
              name: "storageId",
              label: "Storage",
              options: storageOptions,
              isLoading: loadingDependentFields,
              required: true,
              companyScoped: true,
            })}
          </div>
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 mt-6">
            {renderSelectField({
              name: "currencyCode",
              label: "Currency",
              options: currencyOptions,
              required: true,
              companyScoped: true,
            })}
            {renderInputField({
              name: "purchasePrice",
              label: "Purchase Price",
              type: "number",
              step: "0.01",
              required: true,
            })}

            {renderInputField({
              name: "costPrice",
              label: "Cost Price",
              type: "number",
              step: "0.01",
              required: true,
            })}

            {renderInputField({
              name: "costPerUnit",
              label: "Cost Per Unit",
              type: "number",
              step: "0.01",
              required: true,
            })}

            <div className="space-y-1.5" id="field-barcode">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Barcode <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.barcode || ""}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                  className={`w-full p-4 pr-20 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                    ${errors.barcode ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                  placeholder="Enter Barcode"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <div className="relative group cursor-pointer">
                    <Info
                      size={16}
                      className="text-gray-400 hover:text-gray-600 transition"
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-2">
                      Please enter Barcode.
                      <br />
                      Eg 7007039172588
                    </div>
                  </div>
                  <RefreshCw
                    size={16}
                    className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    onClick={generateBarcode}
                    title="Generate Random Barcode"
                  />
                </div>
              </div>
              {errors.barcode && (
                <p className="text-xs text-red-500">{errors.barcode}</p>
              )}
            </div>

            {renderInputField({
              name: "vendorBarcode",
              label: "Vendor Barcode",
            })}

            {renderInputField({
              name: "batchCode",
              label: "Batch Code / Lot No",
              required: true,
            })}
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-6 ">
              {renderInputField({
                name: "shelfLife",
                label: "Shelf Life",
                type: "number",
                required: true,
              })}
              {renderSelectField({
                name: "shelfLifeUnit",
                label: "Shelf Life Unit",
                options: SHELF_LIFE_UNIT_OPTIONS,
                required: true,
              })}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={1}
                className="w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white border-gray-200 hover:border-gray-300 resize-none"
                placeholder="Enter Description"
              />
            </div>
            {renderSelectField({
              name: "isScrap",
              label: "Is Scrap?",
              options: YES_NO_OPTIONS,
              required: true,
            })}

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-3">
                Item Images <span className="text-red-400 ml-1">*</span>
              </label>

              <div
                className="relative border-2 border-dashed border-[#1565c0] rounded-md p-4 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition w-full"
                onClick={() =>
                  !isUploading &&
                  document.getElementById("item-form-image-input")?.click()
                }
              >
                <span className="text-gray-500 text-sm">Choose Files</span>
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

              {isUploading && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 max-w-[120px]">
                    <div className="h-[22px] w-full bg-[#e0e0e0] overflow-hidden flex items-center">
                      <div
                        className="h-full bg-[#1565c0] transition-all duration-200 flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        {uploadProgress > 20 && `${uploadProgress}%`}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      cancelUpload();
                    }}
                    className="text-[#1565c0] text-[13px] font-medium hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {(existingImages.length > 0 || imagePreviews.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {existingImages.map((img, idx) => (
                    <div
                      key={`ext_${img.id || idx}`}
                      className="relative inline-block self-start"
                    >
                      <img
                        src={img.url || img.fileUrl}
                        alt="Preview"
                        className={`w-[84px] h-[64px] object-cover rounded border ${idx === 0 ? "border-blue-500 border-2" : "border-gray-300"} shadow-sm`}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageToDelete({ type: "existing", index: idx });
                        }}
                        className="absolute -top-2.5 -right-2.5 bg-gray-400 text-white rounded-full p-0.5 hover:bg-gray-600 transition shadow-md z-10 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.map((preview, idx) => {
                    return (
                      <div
                        key={`new_${idx}`}
                        className="relative inline-block self-start"
                      >
                        <img
                          src={preview}
                          alt="Preview"
                          className={`w-[84px] h-[64px] object-cover rounded border ${existingImages.length === 0 && idx === 0 ? "border-blue-500 border-2" : "border-gray-300"} shadow-sm`}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImageToDelete({ type: "new", index: idx });
                          }}
                          className="absolute -top-2.5 -right-2.5 bg-gray-400 text-white rounded-full p-0.5 hover:bg-gray-600 transition shadow-md z-10 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <input
                id="item-form-image-input"
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            {/* <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Remark
              </label>
              <textarea
                value={formData.remark || ""}
                onChange={(e) => handleChange("remark", e.target.value)}
                rows={1}
                className="w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white border-gray-200 hover:border-gray-300 resize-none"
                placeholder="Enter Description"
              />
            </div> */}

            {renderSelectField({
              name: "status",
              label: "Status",
              options: STATUS_OPTIONS,
              required: true,
            })}
          </div>

          <h3 className="text-sm font-bold text-gray-800 mb-10 mt-10 border-b border-gray-200 pb-2">
            Shipping Details
          </h3>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
            <div className="space-y-6">
              <div className="space-y-1.5" id="field-weight">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                  Weight
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={
                        formData.weight === null ||
                        formData.weight === undefined
                          ? ""
                          : formData.weight
                      }
                      onChange={(e) => handleChange("weight", e.target.value)}
                      className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                        ${errors.weight ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                    {errors.weight && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.weight}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Select
                      instanceId="select-weightUomId"
                      value={
                        uomOptions.find(
                          (opt) =>
                            String(opt.value) === String(formData.weightUomId),
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("weightUomId", opt ? opt.value : "")
                      }
                      options={uomOptions}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Select Weight UOM"
                      noOptionsMessage={() =>
                        user?.isSuperAdmin && !formData.companyId
                          ? " Please select Company."
                          : "No weight uom found"
                      }
                      classNamePrefix="react-select"
                      styles={customSelectStyles(errors.weightUomId, false)}
                    />
                    {errors.weightUomId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.weightUomId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5" id="field-volume">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                  Volume
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={
                        formData.volume === null ||
                        formData.volume === undefined
                          ? ""
                          : formData.volume
                      }
                      onChange={(e) => handleChange("volume", e.target.value)}
                      className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                        ${errors.volume ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                    {errors.volume && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.volume}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Select
                      instanceId="select-volumeUomId"
                      value={
                        uomOptions.find(
                          (opt) =>
                            String(opt.value) === String(formData.volumeUomId),
                        ) || null
                      }
                      onChange={(opt) =>
                        handleChange("volumeUomId", opt ? opt.value : "")
                      }
                      options={uomOptions}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Select Volume UOM"
                      noOptionsMessage={() =>
                        user?.isSuperAdmin && !formData.companyId
                          ? " Please select Company."
                          : "No volume uom found"
                      }
                      classNamePrefix="react-select"
                      styles={customSelectStyles(errors.volumeUomId, false)}
                    />
                    {errors.volumeUomId && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.volumeUomId}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5" id="field-dimensions">
                <div className="flex items-center gap-1.5">
                  <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                    L x W x H
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder=""
                      value={
                        formData.length === null ||
                        formData.length === undefined
                          ? ""
                          : formData.length
                      }
                      onChange={(e) => handleChange("length", e.target.value)}
                      className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                        ${errors.length ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder=""
                      value={
                        formData.width === null || formData.width === undefined
                          ? ""
                          : formData.width
                      }
                      onChange={(e) => handleChange("width", e.target.value)}
                      className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                        ${errors.width ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder=""
                      value={
                        formData.height === null ||
                        formData.height === undefined
                          ? ""
                          : formData.height
                      }
                      onChange={(e) => handleChange("height", e.target.value)}
                      className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                        ${errors.height ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
                    />
                  </div>
                  <div className="relative group cursor-pointer flex items-center justify-center p-2">
                    <Info
                      size={18}
                      className="text-gray-400 hover:text-[#1565c0] transition-colors"
                    />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-2">
                      Length, Width, and Height
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5" id="field-dimensionUomId">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                  Dimension UOM
                </label>
                <Select
                  instanceId="select-dimensionUomId"
                  value={
                    uomOptions.find(
                      (opt) =>
                        String(opt.value) === String(formData.dimensionUomId),
                    ) || null
                  }
                  onChange={(opt) =>
                    handleChange("dimensionUomId", opt ? opt.value : "")
                  }
                  options={uomOptions}
                  isClearable={true}
                  isSearchable={true}
                  placeholder="Select Dimension UOM"
                  noOptionsMessage={() =>
                    user?.isSuperAdmin && !formData.companyId
                      ? " Please select Company."
                      : "No dimension uom found"
                  }
                  classNamePrefix="react-select"
                  styles={customSelectStyles(errors.dimensionUomId, false)}
                />
                {errors.dimensionUomId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.dimensionUomId}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-10 py-15">
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
            ? "Are you sure you want to save this item?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit")
            handleActualSubmit(confirmState.data);
          else router.push("/item");
          setConfirmState({ isOpen: false, type: null, data: null });
        }}
        onCancel={() =>
          setConfirmState({ isOpen: false, type: null, data: null })
        }
      />

      {imageToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"
            onClick={() => setImageToDelete(null)}
          ></div>
          <div className="relative bg-[#f0f0f0] w-72 shadow-2xl z-10 flex flex-col border border-gray-200">
            <div className="bg-[#1565c0] flex justify-between items-center px-4 py-2.5 text-white">
              <span className="text-sm font-semibold tracking-wide">
                Delete
              </span>
              <X
                size={16}
                className="cursor-pointer hover:text-gray-200"
                onClick={() => setImageToDelete(null)}
              />
            </div>
            <div className="p-5 text-sm text-gray-700">
              Are you sure want to delete this?
            </div>
            <div className="p-4 pt-1 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (imageToDelete.type === "existing")
                    removeExistingImage(imageToDelete.index);
                  else removeNewImage(imageToDelete.index);
                  setImageToDelete(null);
                }}
                className="bg-[#1565c0] hover:bg-[#0f57a6] text-white px-5 py-2 text-sm rounded transition cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setImageToDelete(null)}
                className="bg-[#1565c0] hover:bg-[#0f57a6] text-white px-5 py-2 text-sm rounded transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
