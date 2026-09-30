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
import { listPlants } from "@/lib/api/plant-api";
import { listBoms, getBom } from "@/lib/api/bom-api";
import { createProductionOrder, updateProductionOrder } from "@/lib/api/production-order-api";
import { listCustomerCompanies } from "@/lib/api/customer-company-api";
import { productionOrderSchema } from "@/lib/validation/production-order.schema";
import ProductionOrderMaterialTabs from "./ProductionOrderMaterialTabs";
import ConfirmModal from "@/components/common/ConfirmModal";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import AccessDenied from "@/components/common/AccessDenied";
import Loader from "@/components/common/Loader";

import { formatCurrency } from "@/utils/number-formatter";
import productionOrderConfig from "@/config/production-order.config.json";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import NumericInput from "@/components/common/NumericInput";



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
  const [plantOptions, setPlantOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingBoms, setLoadingBoms] = useState(false);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [selectedBomDetails, setSelectedBomDetails] = useState(null);

  const [packageQuantity, setPackageQuantity] = useState(1);
  const [displayPackageQuantity, setDisplayPackageQuantity] = useState(1);
  const [itemCostPerUnit, setItemCostPerUnit] = useState(0);
  const [itemCostPerUnitFormatted, setItemCostPerUnitFormatted] = useState("NA");
  const [estimatedTotalCostFormatted, setEstimatedTotalCostFormatted] = useState("NA");
  const [materialDetails, setMaterialDetails] = useState({
    rawMaterials: [],
    semiFinished: [],
    finishedProducts: [],
  });
  const [dynamicMaterialDetails, setDynamicMaterialDetails] = useState({
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
        title: mode === "create" ? "Add" : "Edit",
        breadcrumbs: [
          {label: "Production", },
          { label: "Production Orders", href: buildRoute("production-order", "list") },
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
      packageQuantity: initialData?.packageQuantity || 1,
      productionDate: initialData?.productionDate
        ? new Date(initialData.productionDate).toISOString().split("T")[0]
        : todayStr,
      referenceNumber: initialData?.referenceNumber || "",
      customerId: initialData?.customerId || "",
      plantId: initialData?.plantId || "",
      remark: initialData?.remark || "",
      status: initialData?.status || "Pending",
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
        packageQuantity: initialData.packageQuantity || 1,
        productionDate: formattedDate,
        referenceNumber: initialData.referenceNumber || "",
        customerId: initialData.customerId || "",
        plantId: initialData.plantId || "",
        remark: initialData.remark || "",
        status: initialData.status || "Pending",
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
    const fetchPlants = async () => {
      setLoadingPlants(true);
      try {
        const plantRes = await listPlants({ page: 1, limit: 100 });
        const plantList = plantRes?.settings?.data?.list || plantRes?.data?.list || plantRes?.data || [];
        setPlantOptions(plantList.map((p) => ({ label: p.name || p.plantName, value: p.id })));
      } catch (err) {
        console.error("Failed to load plants", err);
      } finally {
        setLoadingPlants(false);
      }
    };
    fetchPlants();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const custRes = await listCustomerCompanies({ page: 1, limit: 1000 });
        const custList = custRes?.settings?.data?.list || custRes?.data?.list || custRes?.data || [];
        setCustomerOptions(custList.map((c) => ({ label: c.name || c.customerName, value: c.id })));
      } catch (err) {
        console.error("Failed to load customers", err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, []);

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

        const filteredItemList = itemList.filter(i => i.isInHouseProduction === 'Yes');

        const mappedItems = filteredItemList.map((i) => ({
          label: i.itemName,
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
          label: b.bomName,
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
            bomData.costPerUnitFormatted || (liveCost > 0 ? formatCurrency(liveCost, currencySymbol) : "NA")
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
      const calc = parseFloat((prodQty / primitiveQty).toFixed(4));
      setPackageQuantity(calc);
      setDisplayPackageQuantity(calc);
      setValue("packageQuantity", calc);
      if (calc > 0) clearErrors("packageQuantity");
    }
  }, [selectedItemDetails]);

  const handleProductionQtyChange = (e) => {
    const rawVal = e.target.value;
    setValue("productionQuantity", rawVal);
    setIsDirty(true);

    const val = parseFloat(rawVal) || 0;
    const primitiveQty = selectedItemDetails?.primitiveQuantity || 1;
    const calculatedPkgQty = parseFloat((val / primitiveQty).toFixed(4));
    setPackageQuantity(calculatedPkgQty);
    setDisplayPackageQuantity(calculatedPkgQty);
    setValue("packageQuantity", calculatedPkgQty);
    if (calculatedPkgQty > 0) clearErrors("packageQuantity");
  };

  const handleProductionQtyBlur = (e) => {
    const val = parseFloat(e.target.value) || 0;
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
    setDisplayPackageQuantity(calculatedPkgQty);
    setValue("packageQuantity", calculatedPkgQty);
    if (calculatedPkgQty > 0) clearErrors("packageQuantity");
  };

  const handlePackageQtyChange = (e) => {
    const rawVal = e.target.value;
    setDisplayPackageQuantity(rawVal);
    setIsDirty(true);

    const pkgVal = parseFloat(rawVal) || 0;
    setPackageQuantity(pkgVal);
    setValue("packageQuantity", pkgVal);
    if (pkgVal > 0) clearErrors("packageQuantity");

    const primitiveQty = selectedItemDetails?.primitiveQuantity || 1;
    const calculatedProdQty = parseFloat((pkgVal * primitiveQty).toFixed(4));
    setValue("productionQuantity", calculatedProdQty);
  };

  const handlePackageQtyBlur = (e) => {
    const pkgVal = parseFloat(e.target.value) || 0;
    setPackageQuantity(pkgVal);
    setDisplayPackageQuantity(pkgVal);
    setValue("packageQuantity", pkgVal);
    if (pkgVal > 0) clearErrors("packageQuantity");

    const primitiveQty = selectedItemDetails?.primitiveQuantity || 1;
    const calculatedProdQty = parseFloat((pkgVal * primitiveQty).toFixed(4));

    setValue("productionQuantity", calculatedProdQty);
    clearErrors("productionQuantity");
  };

  useEffect(() => {
    const numPkgQty = Number(packageQuantity) || 0;
    const totalCost = parseFloat((itemCostPerUnit * numPkgQty).toFixed(2));
    const symbol = selectedBomDetails?.currencySymbol || "";
    setEstimatedTotalCostFormatted(
      totalCost > 0
        ? formatCurrency(totalCost, symbol)
        : "NA"
    );
  }, [packageQuantity, itemCostPerUnit, selectedBomDetails?.currencySymbol]);

  useEffect(() => {
    const scale = Number(packageQuantity) || 1;
    const processItems = (items, calculateCost = true) => {
      return (items || []).map((item) => {
        const baseQty = Number(item.totalRequiredQty) || Number(item.qtyPerUnit) || 0;
        const newRequiredQty = baseQty * scale;
        const newTotalCost = calculateCost ? newRequiredQty * (Number(item.unitPrice) || 0) : 0;

        return {
          ...item,
          totalRequiredQty: parseFloat(newRequiredQty.toFixed(4)),
          totalRequiredQtyDisplay: `${parseFloat(newRequiredQty.toFixed(4))}`,
          totalCost: parseFloat(newTotalCost.toFixed(2)),
          totalCostFormatted: newTotalCost > 0
            ? `${selectedBomDetails?.currencySymbol || ""} ${newTotalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : "NA",
        };
      });
    };

    setDynamicMaterialDetails({
      rawMaterials: processItems(materialDetails.rawMaterials, true),
      semiFinished: processItems(materialDetails.semiFinished, false),
      finishedProducts: processItems(materialDetails.finishedProducts, false),
    });
  }, [materialDetails, packageQuantity, selectedBomDetails?.currencySymbol]);

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
      submitFormData.append("packageQuantity", String(formDataToSubmit.packageQuantity));
      submitFormData.append("productionDate", formDataToSubmit.productionDate);
      if (formDataToSubmit.referenceNumber) {
        submitFormData.append("referenceNumber", formDataToSubmit.referenceNumber);
      }
      if (formDataToSubmit.remark) {
        submitFormData.append("remark", formDataToSubmit.remark);
      }
      if (formDataToSubmit.customerId) {
        submitFormData.append("customerId", String(formDataToSubmit.customerId));
      }
      if (formDataToSubmit.plantId) {
        submitFormData.append("plantId", formDataToSubmit.plantId);
      }
      submitFormData.append("status", "Pending");

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
    onBlur = null,
    suffix = null,
    ...props
  }) => {
    if (type === "number") {
      return (
        <div className="space-y-1.5" id={`field-${name}`}>
          <label className="block text-xs font-semibold text-gray-500 tracking-wide">
            {label} {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <div className="relative w-full">
            <NumericInput
              value={valueCustom !== undefined ? valueCustom : watch(name)}
              onChange={(val) => {
                if (onChangeCustom) {
                  onChangeCustom({ target: { value: val } });
                } else {
                  setValue(name, val);
                  setIsDirty(true);
                  if (errors[name]) clearErrors(name);
                }
              }}
              onBlur={(e) => {
                if (onBlur) onBlur(e);
              }}
              disabled={disabled || readOnly}
              className={`w-full p-4 border rounded-lg text-sm transition-all outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                ${suffix ? "pr-20" : ""}
                ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 font-semibold" : "bg-white border-gray-200 hover:border-gray-300"}
                ${errors[name] ? "border-red-400 bg-red-50" : ""}`}
              placeholder={props.placeholder || `Enter ${label}`}
            />
            {suffix && (
              <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gray-100 border-l border-gray-200 rounded-r-lg text-sm text-gray-600 font-medium pointer-events-none">
                {suffix}
              </div>
            )}
          </div>
          {subtext && <p className="text-xs text-gray-400 italic">{subtext}</p>}
          {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message || errors[name]}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-1.5" id={`field-${name}`}>
        <label className="block text-xs font-semibold text-gray-500 tracking-wide">
          {label} {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative w-full">
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
              ${suffix ? "pr-20" : ""}
              ${disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 font-semibold" : "bg-white border-gray-200 hover:border-gray-300"}
              ${errors[name] ? "border-red-400 bg-red-50" : ""}
              ${props.className || ""} ${type === "date" && !disabled && !readOnly ? "cursor-pointer" : ""}`}
            placeholder={props.placeholder || `Enter ${label}`}
            onClick={(e) => {
              if (type === "date" && !disabled && !readOnly && e.target.showPicker) {
                try { e.target.showPicker(); } catch (err) { }
              }
              if (props.onClick) props.onClick(e);
            }}
            onKeyDown={(e) => {
              if (type === "date") e.preventDefault();
              if (props.onKeyDown) props.onKeyDown(e);
            }}
            {...props}
          />
          {suffix && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-gray-100 border-l border-gray-200 rounded-r-lg text-sm text-gray-600 font-medium pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
        {subtext && <p className="text-xs text-gray-400 italic">{subtext}</p>}
        {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message || errors[name]}</p>}
      </div>
    );
  };

  return (
    <div className="pt-6 h-full overflow-y-auto pb-20 px-10 relative">
      {(loading || submitting) && <Loader overlay />}
      <form onSubmit={handleFormSubmit} className="space-y-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          

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

            <div className="space-y-1.5" id="field-customerId">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Customer Name
              </label>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select
                    instanceId="select-customerId"
                    options={customerOptions}
                    isLoading={loadingCustomers}
                    value={
                      customerOptions.find(
                        (i) => String(i.value) === String(field.value),
                      ) || null
                    }
                    onChange={(opt) => {
                      field.onChange(opt ? opt.value : "");
                      setIsDirty(true);
                    }}
                    isDisabled={mode === "edit" || submitting || loadingCustomers}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Select Customer Name"
                    classNamePrefix="react-select"
                    styles={customSelectStyles(
                      errors.customerId,
                      mode === "edit" || submitting || loadingCustomers,
                    )}
                  />
                )}
              />
              {errors.customerId && (
                <p className="text-xs text-red-500">
                  {errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5" id="field-plantId">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide">
                Plant <span className="text-red-400 ml-1">*</span>
              </label>
              <Controller
                name="plantId"
                control={control}
                render={({ field }) => (
                  <Select
                    instanceId="select-plantId"
                    options={plantOptions}
                    value={
                      plantOptions.find(
                        (i) => String(i.value) === String(field.value),
                      ) || null
                    }
                    onChange={(opt) => {
                      field.onChange(opt ? opt.value : "");
                      setIsDirty(true);
                    }}
                    isLoading={loadingPlants}
                    isDisabled={mode === "edit" || submitting}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Select Plant"
                    classNamePrefix="react-select"
                    styles={customSelectStyles(
                      errors.plantId,
                      mode === "edit" || submitting,
                    )}
                  />
                )}
              />
              {errors.plantId && (
                <p className="text-xs text-red-500">
                  {errors.plantId.message}
                </p>
              )}
            </div>
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

            {renderInputField({
              name: "productionQuantity",
              label: "Production Qty",
              suffix: selectedItemDetails?.itemUomName || "Unit(s)",
              type: "number",
              step: "any",
              required: true,
              valueCustom:
                watchProductionQuantity !== undefined &&
                watchProductionQuantity !== null
                  ? watchProductionQuantity
                  : "",
              onChangeCustom: handleProductionQtyChange,
              onBlur: handleProductionQtyBlur,
              placeholder: "Enter Production Qty",
            })}

            {renderInputField({
              name: "packageQuantity",
              label: "Package Qty",
              suffix: selectedItemDetails?.packageUomName || "Unit(s)",
              type: "number",
              step: "any",
              required: true,
              valueCustom:
                displayPackageQuantity !== undefined &&
                displayPackageQuantity !== null
                  ? displayPackageQuantity
                  : "",
              onChangeCustom: handlePackageQtyChange,
              onBlur: handlePackageQtyBlur,
              placeholder: "Enter Package Qty",
            })}

            {renderInputField({
              name: "itemCostPerUnit",
              label: "Item Cost Per Unit",
              readOnly: true,
              disabled: true,
              valueCustom: itemCostPerUnitFormatted,
              subtext: primitiveQtyText,
            })}

            {renderInputField({
              name: "estimatedTotalCost",
              label: "Estimated Total Cost",
              readOnly: true,
              disabled: true,
              valueCustom: estimatedTotalCostFormatted,
            })}

            {renderInputField({
              name: "referenceNumber",
              label: "Reference Number",
              placeholder: "Enter Reference Number",
            })}

            {renderInputField({
              name: "productionDate",
              label: "Production Date",
              type: "date",
              required: true,
              min: todayStr,
              placeholder: "Please Select Production Date",
            })}

            {renderInputField({
              name: "remark",
              label: "Remarks",
              type: "text",
              required: false,
            })}

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
            materialDetails={dynamicMaterialDetails}
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

      <ConfirmModal
        isOpen={confirmState.isOpen}
        actionType={
          confirmState.type === "submit"
            ? mode === "create"
              ? "create"
              : "update"
            : "discard"
        }
        entityName="Production Order"
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
            if (mode === "edit" && (id || initialData?.id)) {
              router.push(
                buildRoute("production-order", "detail", {
                  id: id || initialData?.id,
                }),
              );
            } else {
              router.push(buildRoute("production-order", "list"));
            }
          }
        }}
        onCancel={() =>
          setConfirmState({ isOpen: false, type: null, data: null })
        }
      />

      <ConfirmModal
        isOpen={Boolean(deleteConfirmTarget)}
        actionType="delete"
        entityName="Attachment"
        onConfirm={confirmRemoveFile}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}
