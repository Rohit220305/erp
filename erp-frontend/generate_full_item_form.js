const fs = require('fs');

const fieldsHtml = fs.readFileSync('/var/www/html/training/erp/erp-frontend/item_form_fields.txt', 'utf8');

const fullJsx = `/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { createItem, updateItem } from "@/lib/api/item-api";
import { listCompanies } from "@/lib/api/company-api";
import { listItemCategories } from "@/lib/api/item-category-api";
import { listManufacturers } from "@/lib/api/manufacturer-api";
import { listBrands } from "@/lib/api/brand-api";
import { listItemUoms } from "@/lib/api/item-uom-api";
import { listPackages } from "@/lib/api/package-master-api";
import { listCurrencies } from "@/lib/api/currency-api";
import toast from "react-hot-toast";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import itemConfig from "@/config/item.config.json";
import { getItemSchema } from "@/lib/validation/item.schema";
import MultiImageUploader from "@/components/common/form/MultiImageUploader";

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const USAGE_TYPE_OPTIONS = [
  { label: "Raw Material", value: "Raw Material" },
  { label: "Finished Good", value: "Finished Good" },
  { label: "Consumable", value: "Consumable" },
  { label: "Trading Item", value: "Trading Item" },
];

const INVENTORY_TYPE_OPTIONS = [
  { label: "Inventory", value: "Inventory" },
  { label: "Non-Inventory", value: "Non-Inventory" },
  { label: "Service", value: "Service" },
];

const BASE_DEFAULTS = {
  itemName: "",
  itemCode: "",
  shortName: "",
  printName: "",
  referenceCode: "",
  barcode: "",
  vendorBarcode: "",
  usageType: "",
  companyId: "",
  categoryId: "",
  manufacturerId: "",
  brandId: "",
  inventoryType: "",
  isDecimalAllowed: "No",
  itemUomId: "",
  packageUomId: "",
  unitsPerPacking: 1,
  primitiveQuantity: 1,
  currencyId: "",
  purchasePrice: 0,
  costPrice: 0,
  costPerUnit: 0,
  weight: 0,
  weightUomId: "",
  volume: 0,
  volumeUomId: "",
  length: 0,
  width: 0,
  height: 0,
  dimensionUomId: "",
  shelfLife: 0,
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

export default function ItemForm({ mode = "create", initialData = null, id = null }) {
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
  
  const defaultValues = { ...BASE_DEFAULTS, ...initialData };
  const [formData, setFormData] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [images, setImages] = useState([]);

  const prevCompanyId = useRef(formData.companyId);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
      prevCompanyId.current = initialData.companyId;

      if (initialData.itemImages && Array.isArray(initialData.itemImages)) {
        const existingImgObjects = initialData.itemImages.map((img, index) => ({
          id: \`ext_\${img.id || index}\`,
          originalId: img.id,
          url: img.fileUrl,
          isPrimary: index === initialData.primaryImageIndex,
          isExisting: true
        }));
        setImages(existingImgObjects);
      }
    }
  }, [initialData]);

  useEffect(() => {
    const loadGlobalOptions = async () => {
      try {
        const [uomRes, currRes] = await Promise.all([
          listItemUoms({ page: 1, limit: 1000 }),
          listCurrencies({ page: 1, limit: 1000 })
        ]);
        
        const uoms = uomRes?.data?.list || uomRes?.settings?.data?.list || [];
        setUomOptions(uoms.map(u => ({ label: u.uomName, value: u.id })));
        
        const currencies = currRes?.data?.list || currRes?.settings?.data?.list || [];
        setCurrencyOptions(currencies.map(c => ({ label: \`\${c.currencyCode} - \${c.currencyName}\`, value: c.id })));
      } catch (err) {
        console.error("Failed to load global options", err);
      }
    };
    loadGlobalOptions();

    if (user?.isSuperAdmin) {
      const loadCompanies = async () => {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const compData = compRes?.settings?.data?.list || compRes?.data?.list || [];
          setCompanyOptions(compData.map((c) => ({ label: c.companyName, value: c.id })));
        } catch (error) {
          console.error("Failed to load company options", error);
        }
      };
      loadCompanies();
    }
  }, [user]);
  
  useEffect(() => {
    const effectiveCompanyId = user?.isSuperAdmin ? formData.companyId : (user?.companyId || null);
    
    if (effectiveCompanyId) {
      const fetchDependent = async () => {
        try {
          setLoadingDependentFields(true);
          const filters = [{ key: "companyId", value: effectiveCompanyId, operator: "equal" }];
          
          const [catRes, manRes, brandRes, pkgRes] = await Promise.all([
            listItemCategories({ page: 1, limit: 1000, filters }),
            listManufacturers({ page: 1, limit: 1000, filters }),
            listBrands({ page: 1, limit: 1000, filters }),
            listPackages({ page: 1, limit: 1000, filters })
          ]);
          
          const cats = catRes?.settings?.data?.list || catRes?.data?.list || [];
          setCategoryOptions(cats.map(c => ({ label: c.categoryName, value: c.id })));
          
          const mans = manRes?.settings?.data?.list || manRes?.data?.list || [];
          setManufacturerOptions(mans.map(m => ({ label: m.manufacturerName, value: m.id })));
          
          const brands = brandRes?.settings?.data?.list || brandRes?.data?.list || [];
          setBrandOptions(brands.map(b => ({ label: b.brandName, value: b.id })));
          
          const pkgs = pkgRes?.settings?.data?.list || pkgRes?.data?.list || [];
          setPackageOptions(pkgs.map(p => ({ label: p.packageName, value: p.id })));
        } catch (error) {
          console.error("Failed to load dependent options", error);
        } finally {
          setLoadingDependentFields(false);
        }
      };
      fetchDependent();
      
      if (mode === "create" && prevCompanyId.current && prevCompanyId.current !== effectiveCompanyId) {
        setFormData(prev => ({ ...prev, categoryId: "", manufacturerId: "", brandId: "", packageUomId: "" }));
      }
      prevCompanyId.current = effectiveCompanyId;
    } else {
      setCategoryOptions([]);
      setManufacturerOptions([]);
      setBrandOptions([]);
      setPackageOptions([]);
      prevCompanyId.current = null;
    }
  }, [formData.companyId, user, mode]);

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
        title: mode === "create" ? \`Add \${itemConfig.title}\` : \`Edit \${itemConfig.title}\`,
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: itemConfig.title, href: "/item" },
          { label: mode === "create" ? "Add" : "Edit" },
        ],
      },
    });
    return () => resetConfig();
  }, [setConfig, mode]);

  const requiredPermission = mode === "create"
    ? itemConfig.actions?.createPermission || itemConfig.actions?.header?.[0]?.permission
    : itemConfig.actions?.updatePermission || itemConfig.actions?.row?.[0]?.permission;

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
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
      const errorElement = document.getElementById(\`field-\${firstErrorField}\`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      toast.error("Please fix the validation errors before submitting.");
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
      
      const numericFields = ['companyId', 'categoryId', 'manufacturerId', 'brandId', 'itemUomId', 'packageUomId', 'currencyId', 'weightUomId', 'volumeUomId', 'dimensionUomId', 'unitsPerPacking', 'primitiveQuantity', 'purchasePrice', 'costPrice', 'costPerUnit', 'weight', 'volume', 'length', 'width', 'height', 'shelfLife'];
      numericFields.forEach(field => {
        if (payload[field] !== "" && payload[field] !== null && payload[field] !== undefined) {
          payload[field] = Number(payload[field]);
        } else {
          delete payload[field];
        }
      });

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(payload));
      
      const existingImages = images.filter(img => img.isExisting).map(img => img.originalId);
      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      const primaryIndex = images.findIndex(img => img.isPrimary);
      formDataToSend.append('primaryImageIndex', primaryIndex >= 0 ? primaryIndex : 0);

      const newImages = images.filter(img => !img.isExisting);
      newImages.forEach(img => {
        formDataToSend.append('itemImages', img.file);
      });

      const response = mode === "create" ? await createItem(formDataToSend) : await updateItem(formDataToSend);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(\`Item \${mode === "create" ? "created" : "updated"} successfully!\`);
        router.push("/item");
      } else {
        toast.error(message || \`Failed to \${mode === "create" ? "create" : "update"} item\`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred.");
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
              Item Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="md:col-span-2">
              <MultiImageUploader images={images} onChange={(imgs) => { setImages(imgs); setIsDirty(true); }} maxImages={10} maxSizeMB={5} />
            </div>

            {user?.isSuperAdmin && (
              <div className="space-y-1.5" id="field-companyId">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                  Company <span className="text-red-400 ml-1">*</span>
                </label>
                <Select
                  instanceId="select-companyId"
                  value={companyOptions.find((opt) => String(opt.value) === String(formData.companyId)) || null}
                  onChange={(opt) => handleChange("companyId", opt ? opt.value : "")}
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
            
            \${fieldsHtml}
            
            <div className="space-y-1.5 md:col-span-2" id="field-description">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className={\`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  \${errors.description ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                \`}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>
            
            <div className="space-y-1.5 md:col-span-2" id="field-remark">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Remark
              </label>
              <textarea
                value={formData.remark || ""}
                onChange={(e) => handleChange("remark", e.target.value)}
                rows={3}
                className={\`w-full px-3 py-2.5 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white
                  \${errors.remark ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}
                \`}
              />
              {errors.remark && <p className="text-xs text-red-500">{errors.remark}</p>}
            </div>
            
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              if (isDirty) setConfirmState({ isOpen: true, type: "discard", data: null });
              else router.push("/item");
            }}
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
        title={confirmState.type === "submit" ? "Confirm Submission" : "Discard Changes"}
        message={
          confirmState.type === "submit"
            ? "Are you sure you want to save this item?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") handleActualSubmit(confirmState.data);
          else router.push("/item");
          setConfirmState({ isOpen: false, type: null, data: null });
        }}
        onCancel={() => setConfirmState({ isOpen: false, type: null, data: null })}
      />
    </div>
  );
}
`;

fs.writeFileSync('/var/www/html/training/erp/erp-frontend/src/components/item/ItemForm.jsx', fullJsx);
