"use client";

import { useEffect, useState, useRef } from "react";
import Select from "react-select";
import { useAuth } from "@/context/AuthContext";
import { createItem, updateItem } from "@/lib/api/item-api";
import { listCompanies, getCompany } from "@/lib/api/company-api";
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

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const USAGE_TYPE_OPTIONS = [
  { label: "Finished Tradable", value: "finished_tradable" },
  { label: "Consumable Non-Tradable", value: "consumable_non_tradable" },
  { label: "WIP Non-Tradable", value: "wip_non_tradable" },
  { label: "Non-Consumable Asset", value: "non_consumable_asset" },
];

const INVENTORY_TYPE_OPTIONS = [
  { label: "Bulk", value: "bulk" },
  { label: "Discrete", value: "discrete" },
];

const BASE_DEFAULTS = {
  itemName: "",
  itemCode: "",
  barcode: "",
  usageType: "",
  companyId: "",
  categoryId: "",
  manufacturerId: "",
  brandId: "",
  inventoryType: "",
  isDecimalAllowed: "No",
  itemUomId: "",
  packageUomId: "",
  currencyCode: "",
  weightUomId: "",
  volumeUomId: "",
  dimensionUomId: "",
  batchCode: "",
  isScrap: "No",
  status: "Active",
};

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "42px",
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

export default function ItemDrawerForm({
  mode = "create",
  initialData = null,
  id = null,
  onSuccess = null,
  onClose = null,
}) {
  const { can, user } = useAuth();
  
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
          
          const [catRes, manRes, brandRes, pkgRes, uomRes, compRes] = await Promise.all([
            listItemCategories({ page: 1, limit: 1000, filters }),
            listManufacturers({ page: 1, limit: 1000, filters }),
            listBrands({ page: 1, limit: 1000, filters }),
            listPackages({ page: 1, limit: 1000, filters }),
            listItemUoms({ page: 1, limit: 1000, filters }),
            getCompany(effectiveCompanyId)
          ]);
          
          const cats = catRes?.settings?.data?.list || catRes?.data?.list || [];
          setCategoryOptions(cats.map(c => ({ label: c.categoryName, value: c.id })));
          
          const mans = manRes?.settings?.data?.list || manRes?.data?.list || [];
          setManufacturerOptions(mans.map(m => ({ label: m.manufacturerName, value: m.id })));
          
          const brands = brandRes?.settings?.data?.list || brandRes?.data?.list || [];
          setBrandOptions(brands.map(b => ({ label: b.brandName, value: b.id })));
          
          const pkgs = pkgRes?.settings?.data?.list || pkgRes?.data?.list || [];
          setPackageOptions(pkgs.map(p => ({ label: p.packageName, value: p.id })));
          
          const uoms = uomRes?.settings?.data?.list || uomRes?.data?.list || [];
          setUomOptions(uoms.map(u => ({ label: u.uomName, value: u.id })));
          
          const currencies = compRes?.currencies || [];
          setCurrencyOptions(currencies.map(c => ({ label: `${c.currencyCode} - ${c.currencyName}`, value: c.currencyCode })));
          
        } catch (error) {
          console.error("Failed to load dependent options", error);
        } finally {
          setLoadingDependentFields(false);
        }
      };
      fetchDependent();
      
      if (mode === "create" && prevCompanyId.current && prevCompanyId.current !== effectiveCompanyId) {
        setFormData(prev => ({ 
          ...prev, 
          categoryId: "", 
          manufacturerId: "", 
          brandId: "", 
          packageUomId: "",
          itemUomId: "",
          weightUomId: "",
          volumeUomId: "",
          dimensionUomId: "",
          currencyCode: ""
        }));
      }
      prevCompanyId.current = effectiveCompanyId;
      
    } else {
      setCategoryOptions([]);
      setManufacturerOptions([]);
      setBrandOptions([]);
      setPackageOptions([]);
      setUomOptions([]);
      setCurrencyOptions([]);
      prevCompanyId.current = null;
    }
  }, [formData.companyId, user, mode]);

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
    
    const optionalNumericFields = ['unitsPerPacking', 'primitiveQuantity', 'purchasePrice', 'costPrice', 'costPerUnit', 'weight', 'volume', 'length', 'width', 'height', 'shelfLife'];
    optionalNumericFields.forEach(field => {
      if (!dataToValidate[field]) {
        dataToValidate[field] = 0;
      }
    });
    
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
      const errorElement = document.getElementById(`drawer-field-${firstErrorField}`);
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
      const payload = { ...data };
      if (mode === "edit") payload.id = Number(id);
      if (!user?.isSuperAdmin) {
        payload.companyId = user?.companyId || initialData?.companyId;
      }
      
      const numericFields = ['companyId', 'categoryId', 'manufacturerId', 'brandId', 'itemUomId', 'packageUomId', 'weightUomId', 'volumeUomId', 'dimensionUomId', 'unitsPerPacking', 'primitiveQuantity', 'purchasePrice', 'costPrice', 'costPerUnit', 'weight', 'volume', 'length', 'width', 'height', 'shelfLife'];
      
      numericFields.forEach(field => {
        if (payload[field] !== "" && payload[field] !== null && payload[field] !== undefined) {
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
      
      formDataToSend.append('primaryImageIndex', 0);

      const response = mode === "create"
        ? await createItem(formDataToSend)
        : await updateItem(formDataToSend);

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      const message = response?.message || response?.settings?.message;

      if (isSuccess) {
        toast.success(`Item ${mode === "create" ? "created" : "updated"} successfully!`);
        onSuccess && onSuccess();
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} item`);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ name, label, type = "text", required = false, disabled = false, readOnly = false }) => (
    <div className="mb-4" id={`drawer-field-${name}`}>
      <label className="mb-1 block text-xs font-semibold text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        disabled={disabled}
        readOnly={readOnly}
        value={formData[name] === null || formData[name] === undefined ? "" : formData[name]}
        onChange={(e) => handleChange(name, e.target.value)}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition focus:bg-white focus:border-[#1565c0]
          ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-gray-50 border-gray-300"}
          ${errors[name] ? "border-red-500 bg-red-50" : ""}
        `}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  const SelectField = ({ name, label, options, required = false, isLoading = false, isDisabled = false }) => (
    <div className="mb-4" id={`drawer-field-${name}`}>
      <label className="mb-1 block text-xs font-semibold text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Select
        instanceId={`select-${name}`}
        value={options.find((opt) => String(opt.value) === String(formData[name])) || null}
        onChange={(opt) => handleChange(name, opt ? opt.value : "")}
        options={options}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={true}
        isSearchable={true}
        placeholder={`Select ${label}`}
        classNamePrefix="react-select"
        styles={customSelectStyles(errors[name], isDisabled)}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="flex h-full flex-col text-black bg-white">
      <form onSubmit={handleFormSubmit} id="drawer-form" className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          
          <h3 className="text-sm font-bold text-gray-800 mb-4 border-b pb-2">Basic Info</h3>
          {user?.isSuperAdmin && (
            <SelectField name="companyId" label="Company" options={companyOptions} required isDisabled={mode === "edit"} />
          )}
          <InputField name="itemName" label="Item Name" required />
          <InputField name="itemCode" label="Item Code" required disabled={mode === "edit"} readOnly={mode === "edit"} />
          <InputField name="barcode" label="Barcode" required />
          <SelectField name="usageType" label="Usage Type" options={USAGE_TYPE_OPTIONS} required />
          <SelectField name="status" label="Status" options={STATUS_OPTIONS} required />

          <h3 className="text-sm font-bold text-gray-800 mb-4 mt-6 border-b pb-2">Classification</h3>
          <SelectField name="categoryId" label="Category" options={categoryOptions} isLoading={loadingDependentFields} required />
          <SelectField name="manufacturerId" label="Manufacturer" options={manufacturerOptions} isLoading={loadingDependentFields} required />
          <SelectField name="brandId" label="Brand" options={brandOptions} isLoading={loadingDependentFields} required />

          <h3 className="text-sm font-bold text-gray-800 mb-4 mt-6 border-b pb-2">Packaging</h3>
          <SelectField name="itemUomId" label="Item Base UOM" options={uomOptions} required />
          <SelectField name="packageUomId" label="Package UOM" options={packageOptions} isLoading={loadingDependentFields} required />
          <SelectField name="isDecimalAllowed" label="Is Decimal Allowed?" options={YES_NO_OPTIONS} required />

          <h3 className="text-sm font-bold text-gray-800 mb-4 mt-6 border-b pb-2">Inventory</h3>
          <SelectField name="inventoryType" label="Inventory Type" options={INVENTORY_TYPE_OPTIONS} required />
          <InputField name="batchCode" label="Batch Code / Lot No" required />
          <SelectField name="isScrap" label="Is Scrap?" options={YES_NO_OPTIONS} required />

          <h3 className="text-sm font-bold text-gray-800 mb-4 mt-6 border-b pb-2">Pricing</h3>
          <SelectField name="currencyCode" label="Currency" options={currencyOptions} required />
          
          <h3 className="text-sm font-bold text-gray-800 mb-4 mt-6 border-b pb-2">Mandatory UOMs</h3>
          <SelectField name="weightUomId" label="Weight UOM" options={uomOptions} required />
          <SelectField name="volumeUomId" label="Volume UOM" options={uomOptions} required />
          <SelectField name="dimensionUomId" label="Dimension UOM" options={uomOptions} required />

        </div>

        <div className="border-t bg-gray-50 px-6 pt-4 pb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2.5 text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 cursor-pointer rounded-md bg-[#1565c0] px-4 py-2.5 text-white transition hover:bg-[#0f57a6] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Item"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.type === "submit" ? "Confirm Submission" : "Discard Changes"}
        message={confirmState.type === "submit" ? "Save this item?" : "Discard unsaved changes?"}
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
    </div>
  );
}
