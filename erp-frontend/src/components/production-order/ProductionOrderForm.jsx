"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Select from "react-select";
import { Info, X, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { listCompanies } from "@/lib/api/company-api";
import { listItems, getItem } from "@/lib/api/item-api";
import { listBoms, getBom } from "@/lib/api/bom-api";
import { createProductionOrder, updateProductionOrder } from "@/lib/api/production-order-api";
import { productionOrderSchema } from "@/lib/validation/production-order.schema";
import ProductionOrderMaterialTabs from "./ProductionOrderMaterialTabs";
import ConfirmModal from "@/components/common/ConfirmModal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import AccessDenied from "@/components/common/AccessDenied";
import Loader from "@/components/common/Loader";
import productionOrderConfig from "@/config/production-order.config.json";

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

function FileThumbnailItem({ file, isExisting = false, onRemove }) {
  const fileName = isExisting ? (file.originalFileName || file.fileName || "") : (file.name || "");
  const mimeType = file.type || "";
  const isImage = mimeType.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileName);

  const [previewSrc, setPreviewSrc] = useState(isExisting ? (file.url || file.fileUrl) : null);

  useEffect(() => {
    if (!isExisting && file instanceof File && isImage) {
      const url = URL.createObjectURL(file);
      setPreviewSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isExisting, isImage]);

  if (isImage && previewSrc) {
    return (
      <div className="relative shrink-0 w-16 h-16">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-slate-600 text-white hover:bg-red-500 flex items-center justify-center shadow-md transition cursor-pointer"
          title="Remove file"
        >
          <X size={12} strokeWidth={3} />
        </button>
        <SharedImageZoom
          id={isExisting ? `exist-${file.id}` : `new-${fileName}`}
          src={previewSrc}
          alt={fileName}
          thumbnailClassName="w-16 h-16 rounded-xl border border-gray-200 shadow-xs object-cover"
          objectFit="cover"
        />
      </div>
    );
  }

  return (
    <div
      className="w-16 h-16 rounded-xl bg-slate-100/90 border border-gray-200 relative flex items-center justify-center shrink-0 shadow-xs"
      title={fileName}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full bg-slate-600 text-white hover:bg-red-500 flex items-center justify-center shadow-md transition cursor-pointer"
        title="Remove file"
      >
        <X size={12} strokeWidth={3} />
      </button>
      <div className="flex flex-col items-center justify-center p-1">
        <FileText size={32} strokeWidth={1.5} className={isPdf ? "text-red-500" : "text-[#1565c0]"} />
      </div>
    </div>
  );
}

export default function ProductionOrderForm({ mode = "create", initialData = null, id = null }) {
  const router = useRouter();
  const { can, user } = useAuth();
  const { setConfig, resetConfig } = useHeader();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

  const [companyOptions, setCompanyOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);

  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingBoms, setLoadingBoms] = useState(false);

  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [selectedBomDetails, setSelectedBomDetails] = useState(null);

  const [packageQuantity, setPackageQuantity] = useState(1);
  const [itemCostPerUnit, setItemCostPerUnit] = useState(0);
  const [itemCostPerUnitFormatted, setItemCostPerUnitFormatted] = useState("NA");
  const [estimatedTotalCostFormatted, setEstimatedTotalCostFormatted] = useState("NA");
  const [materialDetails, setMaterialDetails] = useState({
    rawMaterials: [],
    semiFinished: [],
    finishedProducts: [],
  });
  const [isPackageToggleOn, setIsPackageToggleOn] = useState(false);

  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

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
            ? `Add `
            : `Edit `,
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: productionOrderConfig.title, href: "/production-order" },
        ],
      },
    });
    return () => resetConfig && resetConfig();
  }, [mode, setConfig, resetConfig]);

  const requiredPermission =
    mode === "create"
      ? productionOrderConfig.permissions?.create || "PRODUCTION_ORDER_CREATE"
      : productionOrderConfig.permissions?.update || "PRODUCTION_ORDER_UPDATE";

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      companyId: initialData?.companyId || (user?.isSuperAdmin ? "" : user?.companyId || ""),
      itemId: initialData?.itemId || "",
      bomId: initialData?.bomId || "",
      productionQuantity: initialData?.productionQuantity || 0,
      productionDate: initialData?.productionDate
        ? new Date(initialData.productionDate).toISOString().split("T")[0]
        : todayStr,
      referenceNumber: initialData?.referenceNumber || "",
      remark: initialData?.remark || "",
      status: initialData?.status || "Draft",
    },
  });

  const watchCompanyId = watch("companyId");
  const watchItemId = watch("itemId");
  const watchBomId = watch("bomId");
  const watchProductionQuantity = watch("productionQuantity");

  const effectiveCompanyId = user?.isSuperAdmin
    ? watchCompanyId || initialData?.companyId
    : user?.companyId || initialData?.companyId;

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.productionDate
        ? new Date(initialData.productionDate).toISOString().split("T")[0]
        : todayStr;

      reset({
        companyId: initialData.companyId || "",
        itemId: initialData.itemId || "",
        bomId: initialData.bomId || "",
        productionQuantity: initialData.productionQuantity || 0,
        productionDate: formattedDate,
        referenceNumber: initialData.referenceNumber || "",
        remark: initialData.remark || "",
        status: initialData.status || "Draft",
      });

      setExistingAttachments(initialData.attachments || []);
      setPackageQuantity(initialData.packageQuantity || 1);
    }
  }, [initialData, reset, todayStr]);

  useEffect(() => {
    let timer;
    if (isUploading && uploadProgress < 100) {
      timer = setTimeout(() => {
        setUploadProgress((prev) => prev + 25);
      }, 70);
    } else if (isUploading && uploadProgress >= 100) {
      if (pendingFiles) {
        const valid = pendingFiles.filter((f) => f.size <= 100 * 1024 * 1024);
        setFiles((prev) => [...prev, ...valid]);
        setIsDirty(true);
      }
      setIsUploading(false);
      setPendingFiles(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isUploading, uploadProgress, pendingFiles]);

  const handleFilesAdded = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setPendingFiles(Array.from(filesList));
    setIsUploading(true);
    setUploadProgress(0);
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setPendingFiles(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeNewFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  const removeExistingFile = (idToRemove) => {
    setExistingAttachments((prev) => prev.filter((f) => f.id !== idToRemove));
    setIsDirty(true);
  };

  const confirmRemoveFile = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === "existing") {
      removeExistingFile(deleteConfirmTarget.id);
    } else if (deleteConfirmTarget.type === "new") {
      removeNewFile(deleteConfirmTarget.id);
    }
    setDeleteConfirmTarget(null);
  };

  useEffect(() => {
    if (user?.isSuperAdmin) {
      const fetchCompanies = async () => {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const compList = compRes?.settings?.data?.list || compRes?.data?.list || compRes?.data || [];
          setCompanyOptions(compList.map((c) => ({ label: c.companyName, value: c.id })));
        } catch (err) {
          console.error("Failed to load companies", err);
        }
      };
      fetchCompanies();
    }
  }, [user]);

  useEffect(() => {
    if (!effectiveCompanyId) {
      setItemOptions([]);
      setBomOptions([]);
      setSelectedItemDetails(null);
      setSelectedBomDetails(null);
      return;
    }

    const fetchItemsForCompany = async () => {
      setLoadingItems(true);
      try {
        const filters = [{ key: "companyId", value: effectiveCompanyId, operator: "equal" }];
        const itemRes = await listItems({ page: 1, limit: 1000, filters });
        const itemList = itemRes?.settings?.data?.list || itemRes?.data?.list || itemRes?.data || [];

        const mappedItems = itemList.map((i) => ({
          label: `${i.itemName} (${i.itemCode})`,
          value: i.id,
          primitiveQuantity: i.primitiveQuantity || 1,
          itemUomName: i.itemUomName,
          packageUomName: i.packageUomName,
        }));
        setItemOptions(mappedItems);

        if (watchItemId && !mappedItems.some((i) => Number(i.value) === Number(watchItemId)) && Number(watchItemId) !== Number(initialData?.itemId)) {
          setValue("itemId", "");
          setValue("bomId", "");
          setSelectedItemDetails(null);
          setSelectedBomDetails(null);
        }
      } catch (err) {
        console.error("Failed to load items for company", err);
        setItemOptions([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItemsForCompany();
  }, [effectiveCompanyId]);

  useEffect(() => {
    if (!watchItemId) {
      setBomOptions([]);
      setValue("bomId", "");
      setSelectedItemDetails(null);
      setSelectedBomDetails(null);
      return;
    }

    const fetchBomsAndItemDetails = async () => {
      setLoadingBoms(true);
      try {
        const [itemDetailRes, bomRes] = await Promise.all([
          getItem({ id: watchItemId }),
          listBoms({ page: 1, limit: 1000, itemId: watchItemId }),
        ]);

        const itemData = itemDetailRes?.settings?.data || itemDetailRes?.data;
        setSelectedItemDetails(itemData || null);

        const bomList = bomRes?.settings?.data?.list || bomRes?.data?.list || bomRes?.data || [];
        const mappedBoms = bomList.map((b) => ({
          label: `${b.bomName} (${b.bomCode})`,
          value: b.id,
        }));
        setBomOptions(mappedBoms);

        if (initialData && Number(watchItemId) === Number(initialData.itemId)) {
          setValue("bomId", initialData.bomId);
        } else if (watchBomId && !mappedBoms.some((b) => Number(b.value) === Number(watchBomId)) && Number(watchBomId) !== Number(initialData?.bomId)) {
          setValue("bomId", "");
          setSelectedBomDetails(null);
        }
      } catch (err) {
        console.error("Failed to fetch BOMs for item", err);
        setBomOptions([]);
      } finally {
        setLoadingBoms(false);
      }
    };

    fetchBomsAndItemDetails();
  }, [watchItemId]);

  useEffect(() => {
    if (!watchBomId) {
      setSelectedBomDetails(null);
      setItemCostPerUnit(0);
      setItemCostPerUnitFormatted("NA");
      setMaterialDetails({ rawMaterials: [], semiFinished: [], finishedProducts: [] });
      return;
    }

    const fetchBomDetails = async () => {
      try {
        const bomRes = await getBom({ id: watchBomId });
        const bomData = bomRes?.settings?.data || bomRes?.data;
        if (bomData) {
          setSelectedBomDetails(bomData);
          const liveCost = bomData.liveCalculatedCostPerUnit || bomData.costPerUnit || 0;
          const currencySymbol = bomData.currencySymbol || "";

          setItemCostPerUnit(Number(liveCost) || 0);
          setItemCostPerUnitFormatted(
            bomData.costPerUnitFormatted || (liveCost > 0 ? `${currencySymbol ? currencySymbol + " " : ""}${Number(liveCost).toFixed(2)}` : "NA")
          );

          if (bomData.materialDetails) {
            setMaterialDetails(bomData.materialDetails);
          }
        }
      } catch (err) {
        console.error("Failed to fetch BOM details", err);
        toast.error("Failed to fetch BOM details");
      }
    };

    fetchBomDetails();
  }, [watchBomId]);

  useEffect(() => {
    const primitiveQty = Number(selectedItemDetails?.primitiveQuantity) || 1;
    const prodQty = Number(watchProductionQuantity) || 0;
    if (prodQty > 0) {
      setPackageQuantity(parseFloat((prodQty / primitiveQty).toFixed(4)));
    }
  }, [selectedItemDetails, watchProductionQuantity]);

  const handleProductionQtyChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setValue("productionQuantity", val);
    setIsDirty(true);

    const primitiveQty = selectedItemDetails?.primitiveQuantity || 1;

    if (val > 0 && val < primitiveQty) {
      setError("productionQuantity", {
        type: "manual",
        message: `Production Quantity must be greater than or equal to primitive qty (${primitiveQty})`,
      });
    } else {
      clearErrors("productionQuantity");
    }

    const calculatedPkgQty = parseFloat((val / primitiveQty).toFixed(4));
    setPackageQuantity(calculatedPkgQty);
  };

  const handlePackageQtyChange = (e) => {
    const pkgVal = parseFloat(e.target.value) || 0;
    setPackageQuantity(pkgVal);
    setIsDirty(true);

    const primitiveQty = selectedItemDetails?.primitiveQuantity || 1;
    const calculatedProdQty = parseFloat((pkgVal * primitiveQty).toFixed(4));

    setValue("productionQuantity", calculatedProdQty);
    clearErrors("productionQuantity");
  };

  useEffect(() => {
    const numProdQty = Number(watchProductionQuantity) || 0;
    const primitiveQty = Number(selectedItemDetails?.primitiveQuantity) || 1;
    const numPkgQty = numProdQty / primitiveQty;

    const totalCost = parseFloat((itemCostPerUnit * numPkgQty).toFixed(2));
    const symbol = selectedBomDetails?.currencySymbol || "";
    setEstimatedTotalCostFormatted(
      totalCost > 0
        ? `${symbol ? symbol + " " : ""}${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
        : "NA"
    );
  }, [watchProductionQuantity, itemCostPerUnit, selectedItemDetails, selectedBomDetails]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit((data) => {
      setConfirmState({ isOpen: true, type: "submit", data });
    })();
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.push("/production-order");
    }
  };

  const handleActualSubmit = async (formDataToSubmit) => {
    setSubmitting(true);
    try {
      const submitFormData = new FormData();
      if (user?.isSuperAdmin && formDataToSubmit.companyId) {
        submitFormData.append("companyId", String(formDataToSubmit.companyId));
      }
      submitFormData.append("itemId", String(formDataToSubmit.itemId));
      submitFormData.append("bomId", String(formDataToSubmit.bomId));
      submitFormData.append("productionQuantity", String(formDataToSubmit.productionQuantity));
      submitFormData.append("productionDate", formDataToSubmit.productionDate);
      if (formDataToSubmit.referenceNumber) {
        submitFormData.append("referenceNumber", formDataToSubmit.referenceNumber);
      }
      if (formDataToSubmit.remark) {
        submitFormData.append("remark", formDataToSubmit.remark);
      }
      submitFormData.append("status", "Draft");

      files.forEach((file) => {
        submitFormData.append("attachments", file);
      });

      let res;
      if (mode === "create") {
        res = await createProductionOrder(submitFormData);
      } else {
        submitFormData.append("id", String(id || initialData.id));
        const retainedIds = existingAttachments.map((a) => a.id);
        submitFormData.append("retainedAttachments", JSON.stringify(retainedIds));
        res = await updateProductionOrder(submitFormData);
      }

      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      const message = res?.message || res?.settings?.message;

      if (isSuccess) {
        toast.success(
          message || `Production Order ${mode === "create" ? "created" : "updated"} successfully!`
        );
        router.push("/production-order");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} production order`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
      setConfirmState({ isOpen: false, type: null, data: null });
    }
  };

  const primitiveQtyText = selectedItemDetails?.primitiveQuantity
    ? `Production item primitive qty = ${selectedItemDetails.primitiveQuantity} ${selectedItemDetails.itemUomName || ""}`
    : "Select a Production Item to see primitive qty";

  const renderInputField = ({
    name,
    label,
    type = "text",
    required = false,
    disabled = false,
    readOnly = false,
    subtext = null,
    onChangeCustom = null,
    valueCustom = undefined,
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
          valueCustom !== undefined
            ? valueCustom
            : watch(name) === null || watch(name) === undefined
              ? ""
              : watch(name)
        }
        onChange={(e) => {
          if (onChangeCustom) {
            onChangeCustom(e);
          } else {
            setValue(name, e.target.value);
            setIsDirty(true);
            if (errors[name]) clearErrors(name);
          }
        }}
        className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
          ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 font-semibold" : "bg-white border-gray-200 hover:border-gray-300"}
          ${errors[name] ? "border-red-400 bg-red-50" : ""}`}
        placeholder={props.placeholder || `Enter ${label}`}
        {...props}
      />
      {subtext && <p className="text-xs text-gray-400 italic">{subtext}</p>}
      {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message || errors[name]}</p>}
    </div>
  );

  return (
    <div className="pt-6 h-full overflow-y-auto pb-20 px-10 relative">
      {(loading || submitting) && <Loader overlay />}
      <form onSubmit={handleFormSubmit} className="space-y-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 tracking-wide">
              Production Order Details
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-6">
            {user?.isSuperAdmin && (
              <div className="space-y-1.5" id="field-companyId">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                  Company <span className="text-red-400 ml-1">*</span>
                </label>
                <Controller
                  name="companyId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      instanceId="select-companyId"
                      options={companyOptions}
                      value={
                        companyOptions.find(
                          (c) => String(c.value) === String(field.value),
                        ) || null
                      }
                      onChange={(opt) => {
                        field.onChange(opt ? opt.value : "");
                        setIsDirty(true);
                      }}
                      isDisabled={mode === "edit"}
                      isClearable={true}
                      isSearchable={true}
                      placeholder="Select Company"
                      classNamePrefix="react-select"
                      styles={customSelectStyles(
                        errors.companyId,
                        mode === "edit",
                      )}
                    />
                  )}
                />
                {errors.companyId && (
                  <p className="text-xs text-red-500">
                    {errors.companyId.message}
                  </p>
                )}
              </div>
            )}
            {user?.isSuperAdmin && <div className="hidden md:block"></div>}

            <div className="space-y-1.5" id="field-itemId">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Production Item <span className="text-red-400 ml-1">*</span>
              </label>
              <Controller
                name="itemId"
                control={control}
                render={({ field }) => (
                  <Select
                    instanceId="select-itemId"
                    options={itemOptions}
                    value={
                      itemOptions.find(
                        (i) => String(i.value) === String(field.value),
                      ) || null
                    }
                    onChange={(opt) => {
                      field.onChange(opt ? opt.value : "");
                      setIsDirty(true);
                    }}
                    isLoading={loadingItems}
                    isDisabled={
                      mode === "edit" || (user?.isSuperAdmin && !watchCompanyId)
                    }
                    isClearable={true}
                    isSearchable={true}
                    placeholder={
                      user?.isSuperAdmin && !watchCompanyId
                        ? "Select Company First"
                        : "Select Production Item"
                    }
                    noOptionsMessage={() =>
                      user?.isSuperAdmin && !watchCompanyId
                        ? " Please select Company first."
                        : "No items found"
                    }
                    classNamePrefix="react-select"
                    styles={customSelectStyles(
                      errors.itemId,
                      mode === "edit" ||
                        (user?.isSuperAdmin && !watchCompanyId),
                    )}
                  />
                )}
              />
              {errors.itemId && (
                <p className="text-xs text-red-500">{errors.itemId.message}</p>
              )}
            </div>

            <div className="space-y-1.5" id="field-bomId">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Bill Of Material <span className="text-red-400 ml-1">*</span>
              </label>
              <Controller
                name="bomId"
                control={control}
                render={({ field }) => (
                  <Select
                    instanceId="select-bomId"
                    options={bomOptions}
                    value={
                      bomOptions.find(
                        (b) => String(b.value) === String(field.value),
                      ) || null
                    }
                    onChange={(opt) => {
                      field.onChange(opt ? opt.value : "");
                      setIsDirty(true);
                    }}
                    isLoading={loadingBoms}
                    isDisabled={mode === "edit" || !watchItemId}
                    isClearable={true}
                    isSearchable={true}
                    placeholder={
                      watchItemId
                        ? "Select Bill Of Material"
                        : "Select Production Item First"
                    }
                    noOptionsMessage={() =>
                      !watchItemId
                        ? " Please select Production Item first."
                        : "No BOMs found"
                    }
                    classNamePrefix="react-select"
                    styles={customSelectStyles(
                      errors.bomId,
                      mode === "edit" || !watchItemId,
                    )}
                  />
                )}
              />
              {errors.bomId && (
                <p className="text-xs text-red-500">{errors.bomId.message}</p>
              )}
            </div>

            {/* Production Qty Input */}
            {renderInputField({
              name: "productionQuantity",
              label: `Production Qty (${selectedItemDetails?.itemUomName || "Units"})`,
              type: "number",
              step: "any",
              required: true,
              valueCustom: watchProductionQuantity || "",
              onChangeCustom: handleProductionQtyChange,
              placeholder: "Enter Production Quantity",
            })}

            {/* Package Qty Input */}
            {renderInputField({
              name: "packageQuantity",
              label: `Package Qty (${selectedItemDetails?.packageUomName || "Unit(s)"})`,
              type: "number",
              step: "any",
              required: true,
              valueCustom: packageQuantity || "",
              onChangeCustom: handlePackageQtyChange,
              placeholder: "Enter Package Quantity",
            })}

            {/* Item Cost Per Unit */}
            {renderInputField({
              name: "itemCostPerUnit",
              label: "Item Cost Per Unit",
              readOnly: true,
              disabled: true,
              valueCustom: itemCostPerUnitFormatted,
              subtext: primitiveQtyText,
            })}

            {/* Estimated Total Cost */}
            {renderInputField({
              name: "estimatedTotalCost",
              label: "Estimated Total Cost",
              readOnly: true,
              disabled: true,
              valueCustom: estimatedTotalCostFormatted,
            })}

            {/* Reference Number */}
            {renderInputField({
              name: "referenceNumber",
              label: "Reference Number",
              placeholder: "Enter Reference Number",
            })}

            {/* Production Date */}
            {renderInputField({
              name: "productionDate",
              label: "Production Date",
              type: "date",
              required: true,
            })}

            {renderInputField({
              name: "remark",
              label: "Remarks",
              type: "text",
              required: true,
            })}

           
            {/* Attachment Field (Matching BomStep1Details.jsx reference) */}
            <div className="">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">
                Attachment
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                  !isUploading &&
                  document.getElementById("po-form-file-input")?.click()
                }
                className={`relative border-2 border-dashed border-[#1565c0] rounded-md px-4 py-3 flex items-center justify-center cursor-pointer hover:bg-blue-50/50 transition w-full h-[48px] ${
                  dragActive ? "bg-blue-50/80 border-blue-600" : "bg-white"
                }`}
              >
                <span className="text-gray-500 text-sm">Drop files here</span>
                <div
                  className="absolute right-4 top-1/2 -translate-y-1/2 group flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info
                    size={18}
                    className="text-gray-400 cursor-pointer hover:text-gray-600"
                  />
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                    Valid extensions : pdf, doc, docx, png, jpg, jpeg.
                    <br />
                    Valid size : Less than (&lt;) 100 MB.
                  </div>
                </div>
                <input
                  id="po-form-file-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && handleFilesAdded(e.target.files)
                  }
                />
              </div>

              {isUploading && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1 max-w-[140px]">
                    <div className="h-[22px] w-full bg-[#e0e0e0] overflow-hidden flex items-center rounded-xs">
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

              {/* Uploaded Files Square Thumbnail Cards Grid with SharedImageZoom & Delete Confirm */}
              {(existingAttachments.length > 0 || files.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {existingAttachments.map((file) => (
                    <FileThumbnailItem
                      key={file.id}
                      file={file}
                      isExisting={true}
                      onRemove={() =>
                        setDeleteConfirmTarget({
                          type: "existing",
                          id: file.id,
                        })
                      }
                    />
                  ))}

                  {files.map((file, idx) => (
                    <FileThumbnailItem
                      key={`new-${idx}`}
                      file={file}
                      isExisting={false}
                      onRemove={() =>
                        setDeleteConfirmTarget({ type: "new", id: idx })
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          
        <ProductionOrderMaterialTabs
          materialDetails={materialDetails}
          packageQuantity={packageQuantity}
          currencySymbol={selectedBomDetails?.currencySymbol || ""}
          showToggle={true}
          isPackageToggleOn={isPackageToggleOn}
          onPackageToggleChange={setIsPackageToggleOn}
        />
        </div>

       
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancelClick}
            className="px-6 py-4 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-4 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting
              ? "Saving..."
              : mode === "create"
                ? "Place Order"
                : "Update Order"}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === "submit"
            ? mode === "create"
              ? "Confirm Place Order"
              : "Confirm Update Order"
            : "Discard Changes?"
        }
        message={
          confirmState.type === "submit"
            ? mode === "create"
              ? "Are you sure you want to create this Production Order?"
              : "Are you sure you want to update this Production Order?"
            : "You have unsaved changes. Are you sure you want to discard them?"
        }
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit(confirmState.data);
          } else {
            setConfirmState({ isOpen: false, type: null, data: null });
            router.push("/production-order");
          }
        }}
        onCancel={() =>
          setConfirmState({ isOpen: false, type: null, data: null })
        }
      />

      {/* Delete Confirmation Modal for File Attachments */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteConfirmTarget)}
        title="Delete"
        message="Are you sure want to delete this?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveFile}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}
