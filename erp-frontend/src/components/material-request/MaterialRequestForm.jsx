"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { Plus, Trash2, Upload, FileText, X, Info, Package } from "lucide-react";
import toast from "react-hot-toast";

import { useHeader } from "@/context/HeaderContext";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { listPlants } from "@/lib/api/plant-api";
import { listItems } from "@/lib/api/item-api";
import {
  createMaterialRequest,
  getMaterialRequest,
} from "@/lib/api/material-request-api";
import { materialRequestSchema } from "./schema/materialRequestSchema";
import ConfirmModal from "@/components/common/ConfirmModal";
import Loader from "@/components/common/Loader";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import NumericInput from "@/components/common/NumericInput";

const DEFAULT_WAREHOUSES = [
  { label: "Central Raw Material Warehouse", value: 1, name: "Central Raw Material Warehouse" },
  { label: "Main Finished Goods Warehouse", value: 2, name: "Main Finished Goods Warehouse" },
  { label: "Plant Raw Material Store", value: 3, name: "Plant Raw Material Store" },
  { label: "General Production Store", value: 4, name: "General Production Store" },
];

function FileThumbnailItem({ file, onRemove }) {
  const fileName = file.name || "";
  const mimeType = file.type || "";
  const isImage =
    mimeType.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileName);

  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    if (file instanceof File && isImage) {
      const url = URL.createObjectURL(file);
      setPreviewSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isImage]);

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
          id={`mr-file-${fileName}`}
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
        <FileText
          size={32}
          strokeWidth={1.5}
          className={isPdf ? "text-red-500" : "text-[#1565c0]"}
        />
      </div>
    </div>
  );
}

export default function MaterialRequestForm({
  id = null,
  initialData = null,
  onSuccess = null,
  onCancel = null,
}) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { setConfig, resetConfig } = useHeader();
  const mode = id ? "edit" : "create";

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: ["refresh"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: mode === "create" ? "Add" : "Edit",
        breadcrumbs: [
          { label: "Production",},
          { label: "Material Request", href: buildRoute("material-request", "list") },
        ],
      },
    });
    return () => {
      resetConfig && resetConfig();
    };
  }, [mode, setConfig, resetConfig]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    data: null,
  });

  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState(null);

  const [plantOptions, setPlantOptions] = useState([]);
  const [rawItemsList, setRawItemsList] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);

  const [plantId, setPlantId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [remark, setRemark] = useState("");
  const [attachments, setAttachments] = useState([]);

  const [items, setItems] = useState([
    { rowId: Date.now(), itemId: "", requestedQty: 1, uomName: "Unit(s)" },
  ]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    let timer;
    if (isUploading && uploadProgress < 100) {
      timer = setTimeout(() => {
        setUploadProgress((prev) => prev + 25);
      }, 70);
    } else if (isUploading && uploadProgress >= 100) {
      if (pendingFiles) {
        const valid = pendingFiles.filter((f) => f.size <= 100 * 1024 * 1024);
        setAttachments((prev) => [...prev, ...valid]);
      }
      setIsUploading(false);
      setPendingFiles(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isUploading, uploadProgress, pendingFiles]);

  const ALLOWED_EXTENSIONS = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "png",
    "jpg",
    "jpeg",
    "webp",
  ];

  const handleFilesAdded = (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const filesArray = Array.from(filesList);

    const validFiles = filesArray.filter((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ALLOWED_EXTENSIONS.includes(ext);
    });

    if (validFiles.length < filesArray.length) {
      toast.error("Invalid file format. Allowed: pdf, doc, docx, xls, xlsx, png, jpg, jpeg, webp");
    }

    if (validFiles.length === 0) return;

    setPendingFiles(validFiles);
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);

        const plantRes = await listPlants({ page: 1, limit: 100 });
        const plantList =
          plantRes?.settings?.data?.list || plantRes?.data?.list || plantRes?.data || [];
        const formattedPlants = plantList.map((p) => ({
          label: p.name || p.plantName,
          value: p.id,
        }));
        setPlantOptions(formattedPlants);

        const itemRes = await listItems({ page: 1, limit: 1000 });
        const itemList =
          itemRes?.settings?.data?.list || itemRes?.data?.list || itemRes?.data || [];
        setRawItemsList(itemList);

        const formattedItems = itemList.map((i) => ({
          label: `${i.itemName}`,
          value: i.id,
          uomName: i.uomName || i.itemUomName || "Unit(s)",
          itemCode: i.itemCode,
          itemName: i.itemName,
        }));
        setItemOptions(formattedItems);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
        toast.error("Failed to load plants or items.");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (id && !initialData) {
      const loadDetails = async () => {
        try {
          setLoading(true);
          const res = await getMaterialRequest({ id });
          const data = res?.settings?.data || res?.data;
          if (data) {
            setPlantId(data.plantId || "");
            setWarehouseId(data.warehouseId || "");
            setWarehouseName(data.warehouseName || "");
            setRemark(data.remark || "");
            if (data.items && data.items.length > 0) {
              setItems(
                data.items.map((i, index) => ({
                  rowId: Date.now() + index,
                  itemId: i.itemId,
                  requestedQty: i.requestedQty || 1,
                  uomName: i.uomName || "Unit(s)",
                }))
              );
            }
          }
        } catch (err) {
          toast.error("Failed to load material request details.");
        } finally {
          setLoading(false);
        }
      };
      loadDetails();
    } else if (initialData) {
      setPlantId(initialData.plantId || "");
      setWarehouseId(initialData.warehouseId || "");
      setWarehouseName(initialData.warehouseName || "");
      setRemark(initialData.remark || "");
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((i, index) => ({
            rowId: Date.now() + index,
            itemId: i.itemId,
            requestedQty: i.requestedQty || 1,
            uomName: i.uomName || "Unit(s)",
          }))
        );
      }
    }
  }, [id, initialData]);

  const selectedItemIds = new Set(
    items.map((row) => Number(row.itemId)).filter(Boolean)
  );

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        rowId: Date.now() + Math.random(),
        itemId: "",
        requestedQty: 1,
        uomName: "Unit(s)",
      },
    ]);
  };

  const handleRemoveRow = (rowId) => {
    if (items.length === 1) {
      toast.error("At least one material item is required.");
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: "delete",
      data: { rowId },
    });
  };

  const executeRemoveRow = () => {
    const { rowId } = confirmModal.data;
    setItems((prev) => prev.filter((row) => row.rowId !== rowId));
    setConfirmModal({ isOpen: false, type: "", data: null });
  };

  const handleItemChange = (rowId, selectedOption) => {
    const selectedItemId = selectedOption ? Number(selectedOption.value) : "";
    const selectedUom = selectedOption?.uomName || "Unit(s)";

    setItems((prev) =>
      prev.map((row) => {
        if (row.rowId === rowId) {
          return {
            ...row,
            itemId: selectedItemId,
            uomName: selectedUom,
          };
        }
        return row;
      })
    );

    if (errors[`items_${rowId}`]) {
      setErrors((prev) => ({ ...prev, [`items_${rowId}`]: null }));
    }
  };

  const handleQtyChange = (rowId, val) => {
    const qty = val === "" ? "" : Number(val);
    setItems((prev) =>
      prev.map((row) => {
        if (row.rowId === rowId) {
          return { ...row, requestedQty: qty };
        }
        return row;
      })
    );
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payloadToValidate = {
      plantId: plantId ? Number(plantId) : "",
      warehouseId: warehouseId ? Number(warehouseId) : "",
      remark: remark || "",
      items: items.map((i) => ({
        itemId: i.itemId ? Number(i.itemId) : "",
        requestedQty: i.requestedQty !== "" ? Number(i.requestedQty) : 0,
      })),
    };

    const result = materialRequestSchema.safeParse(payloadToValidate);

    if (!result.success) {
      const formattedErrors = {};
      result.error.issues.forEach((issue) => {
        const pathStr = issue.path.join("_");
        formattedErrors[pathStr] = issue.message;
      });
      setErrors(formattedErrors);
      toast.error(result.error.issues[0]?.message || "Please fix validation errors.");
      return;
    }

    setErrors({});
    setConfirmModal({
      isOpen: true,
      type: "request",
      data: null,
    });
  };

  const executeSubmit = async () => {
    setConfirmModal({ isOpen: false, type: "", data: null });
    setSubmitting(true);

    try {
      let payload;
      const basePayload = {
        plantId: Number(plantId),
        warehouseId: Number(warehouseId),
        warehouseName: warehouseName || "Central Raw Material Warehouse",
        isGlobal: 1,
        items: items.map((i) => ({
          itemId: Number(i.itemId),
          requestedQty: Number(i.requestedQty),
        })),
      };
      if (remark) basePayload.remark = remark;

      if (attachments && attachments.length > 0) {
        payload = new FormData();
        payload.append("plantId", String(basePayload.plantId));
        payload.append("warehouseId", String(basePayload.warehouseId));
        payload.append("warehouseName", basePayload.warehouseName);
        payload.append("isGlobal", "1");
        if (basePayload.remark) payload.append("remark", basePayload.remark);
        
        payload.append("items", JSON.stringify(basePayload.items));
        
        attachments.forEach((file) => {
          payload.append("attachments", file);
        });
      } else {
        payload = basePayload;
      }

      const res = await createMaterialRequest(payload);

      if (res?.settings?.success === 1 || res?.success === 1) {
        toast.success(
          res?.settings?.message || "Material Request created successfully!"
        );
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/material-request");
        }
      } else {
        toast.error(
          res?.settings?.message || res?.message || "Failed to create Material Request"
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Failed to submit material request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setConfirmModal({ isOpen: true, type: "discard", data: null });
  };

  const executeDiscard = () => {
    setConfirmModal({ isOpen: false, type: "", data: null });
    if (onCancel) {
      onCancel();
    } else {
      router.push("/material-request");
    }
  };

  const customSelectStyles = (error, disabled) => ({
    control: (base, state) => ({
      ...base,
      pointerEvents: "auto",
      borderColor: error ? "#f87171" : state.isFocused ? "#1565c0" : "#d1d5db",
      borderRadius: "0.5rem",
      minHeight: "44px",
      backgroundColor: disabled ? "#f9fafb" : "#ffffff",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(21, 101, 192, 0.2)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "0.875rem",
      "&:hover": {
        borderColor: disabled ? "#d1d5db" : error ? "#f87171" : "#1565c0",
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
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      overflowY: "auto",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    dropdownIndicator: (base, state) => ({
      ...base,
      transition: "all .2s ease",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
    }),
  });
  if (loading) { 
    return (<Loader overlay />);
  }
  return (
    <div className="py-6  h-full ">
      <div className="h-full overflow-y-scroll px-10">

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Plant<span className="text-red-500">*</span>
                </label>
                <Select
                  styles={customSelectStyles(errors.plantId)}
                  isClearable={true}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  options={plantOptions}
                  placeholder="Select Plant"
                  value={plantOptions.find((p) => p.value === Number(plantId)) || null}
                  onChange={(selected) => {
                    setPlantId(selected ? selected.value : "");
                    if (errors.plantId) setErrors((prev) => ({ ...prev, plantId: null }));
                  }}
                />
                {errors.plantId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    {errors.plantId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Attachments 
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() =>
                    !isUploading && fileInputRef.current?.click()
                  }
                  className={`relative border-2 border-dashed border-[#1565c0] rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/50 transition min-h-[110px] ${
                    dragActive ? "bg-blue-50/80 border-blue-600" : "bg-gray-50/30"
                  }`}
                >
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <p className="text-[13px] font-medium text-gray-600">
                    Drop files here or click to browse
                  </p>
                  <div
                    className="absolute right-4 top-4 group flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info
                      size={18}
                      className="text-gray-400 cursor-pointer hover:text-gray-600"
                    />
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                      <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                      Valid extensions : pdf, doc, docx, xls, xlsx, png, jpg, jpeg, webp.
                      <br />
                      Valid size : Less than (&lt;) 100 MB.
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    id="mr-form-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
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

                {attachments.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {attachments.map((file, idx) => (
                      <FileThumbnailItem
                        key={`file-${idx}-${file.name}`}
                        file={file}
                        onRemove={() => handleRemoveAttachment(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Warehouse<span className="text-red-500">*</span>
                </label>
                <Select
                  styles={customSelectStyles(errors.warehouseId)}
                  isClearable={true}
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  options={DEFAULT_WAREHOUSES}
                  placeholder="Select Warehouse"
                  value={
                    DEFAULT_WAREHOUSES.find((w) => w.value === Number(warehouseId)) || null
                  }
                  onChange={(selected) => {
                    setWarehouseId(selected ? selected.value : "");
                    setWarehouseName(selected ? selected.name : "");
                    if (errors.warehouseId) setErrors((prev) => ({ ...prev, warehouseId: null }));
                  }}
                />
                {errors.warehouseId && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    {errors.warehouseId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  Remark
                </label>
                <textarea
                  rows={4}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter remarks or special instructions..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1565c0]/20 focus:border-[#1565c0] resize-none bg-gray-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h2 className="text-[16px] font-bold text-gray-900">Material Details</h2>
            <button
              type="button"
              onClick={handleAddRow}
              className="bg-[#1565c0] hover:bg-[#0f57a6] text-white font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <Plus size={14} /> Add Material
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-4 py-3 w-[50%]">Item Name*</th>
                  <th className="px-4 py-3 w-[35%]">Order Qty*</th>
                  <th className="px-4 py-3 w-[15%] text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {items.map((row, index) => {
                  const filteredItemOptions = itemOptions.filter(
                    (opt) =>
                      !selectedItemIds.has(Number(opt.value)) ||
                      Number(opt.value) === Number(row.itemId)
                  );

                  const selectedOpt = itemOptions.find(
                    (o) => Number(o.value) === Number(row.itemId)
                  );

                  return (
                    <tr key={row.rowId} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="max-w-[350px]">
                          <Select
                            styles={customSelectStyles(errors[`items_${index}_itemId`])}
                            isClearable={true}
                            menuPortalTarget={
                              typeof document !== "undefined" ? document.body : null
                            }
                            options={filteredItemOptions}
                            placeholder="Select Item"
                            value={selectedOpt || null}
                            onChange={(selected) =>
                              handleItemChange(row.rowId, selected)
                            }
                          />
                        </div>
                        {errors[`items_${index}_itemId`] && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                             {errors[`items_${index}_itemId`]}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[200px] flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#1565c0]/20 focus-within:border-[#1565c0]">
                          <NumericInput
                            maxDecimals={4}
                            min={1}
                            value={row.requestedQty}
                            onChange={(val) => handleQtyChange(row.rowId, val)}
                            className="w-full py-2 px-3 text-right font-mono text-[14px] font-semibold text-gray-900 focus:outline-none"
                          />
                          <span className="bg-gray-100 text-gray-500 px-3 py-2 text-[12px] font-medium border-l border-gray-200 shrink-0">
                            {row.uomName || "Unit(s)"}
                          </span>
                        </div>
                        {errors[`items_${index}_requestedQty`] && (
                          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                          {errors[`items_${index}_requestedQty`]}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.rowId)}
                          disabled={items.length === 1}
                          className={`p-2 rounded-md transition cursor-pointer inline-flex items-center justify-center ${
                            items.length === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {errors.items && typeof errors.items === "string" && (
            <p className="p-4 text-xs text-red-500 bg-red-50/50 flex items-center gap-1.5 border-t border-red-100 mt-4 rounded-lg">
             {errors.items}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg bg-[#1565c0] hover:bg-[#0d47a1] text-white text-[14px] font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-[14px] font-semibold transition-colors cursor-pointer"
          >
            Discard
          </button>
        </div>
      </form>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        actionType={
          confirmModal.type === "request" ? "create" : confirmModal.type
        }
        entityName={
          confirmModal.type === "delete"
            ? "item"
            : confirmModal.type === "request"
              ? "Material Request"
              : ""
        }
        onConfirm={() => {
          if (confirmModal.type === "request") executeSubmit();
          else if (confirmModal.type === "discard") executeDiscard();
          else if (confirmModal.type === "delete") executeRemoveRow();
        }}
        onCancel={() =>
          setConfirmModal({ isOpen: false, type: "", data: null })
        }
      />
    </div>
  );
}
