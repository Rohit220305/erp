"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, Package, Info, X, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { createMaterialRequest } from "@/lib/api/material-request-api";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import AccessDenied from "@/components/common/AccessDenied";
import { formatNumber } from "@/utils/number-formatter";
import NumericInput from "@/components/common/NumericInput";
import ModuleLink from "@/components/common/ModuleLink";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import SideDrawer from "@/components/common/SideDrawer";
import NoDataMessage from "@/components/common/NoDataMessage";
import ConfirmModal from "@/components/common/ConfirmModal";
import { displayFormat } from "@/utils/no-data-formatter";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";

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

export default function ProductionMaterialRequestForm({
  batchData,
  initialSuggestions = [],
}) {
 

  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

  const [remark, setRemark] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sideDrawerState, setSideDrawerState] = useState({
    isOpen: false,
    moduleName: null,
    id: null,
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    data: null,
  });

  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState(null);

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
    const code = batchData?.batchCode || "Details";
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
        title: "Request Material",
        breadcrumbs: [
          {label: "Production", },
          {
            label: "Production Batch",
            href: buildRoute("production-batch", "detail", {
              id: batchData.id,
            }),
          },
        ],
        actionButton: null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, batchData]);

  useEffect(() => {
    if (initialSuggestions && initialSuggestions.length > 0) {
      const formatted = initialSuggestions.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName || "",
        itemCode: item.itemCode || "",
        itemImageUrl: item.itemImageUrl || "",
        uomName: item.uomName || "Unit(s)",
        availableQty: Number(item.availableStock || 0),
        suggestedQty: item.shortage,
        requestedQty: item.shortage ?? 0,
      }));

      setItems(formatted);
    }
  }, [initialSuggestions]);

  if (batchData?.accessDenied) {
    return (
      <AccessDenied
        missingPermission={
          batchData.requiredPermission || CAPABILITIES.MATERIAL_REQUEST?.CREATE
        }
      />
    );
  }

  const handleOpenDrawer = (moduleName, id) => {
    if (moduleName && id) {
      setSideDrawerState({ isOpen: true, moduleName, id });
    }
  };

  const handleQuantityChange = (itemId, val) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, requestedQty: val } : item,
      ),
    );
  };

  const handleRemoveItem = (itemId) => {
    setConfirmModal({ isOpen: true, type: "delete", data: { itemId } });
  };

  const executeRemoveItem = () => {
    const { itemId } = confirmModal.data;
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));
    setConfirmModal({ isOpen: false, type: "", data: null });
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setAttachments((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("Please add at least one item to the Material Request.");
      return;
    }

    const payloadItems = items
      .map((item) => ({
        itemId: item.itemId,
        requestedQty: Number(item.requestedQty) ,
      }))
      .filter((i) => i.requestedQty > 0);

    if (payloadItems.length === 0) {
      setErrorMsg(
        "At least one item must have a requested quantity greater than 0.",
      );
      return;
    }

    setConfirmModal({ isOpen: true, type: "request", data: { payloadItems } });
  };

  const executeSubmit = async () => {
    const { payloadItems } = confirmModal.data;
    setConfirmModal({ isOpen: false, type: "", data: null });
    setIsSubmitting(true);
    
    try {
      let payload;

      if (attachments && attachments.length > 0) {
        payload = new FormData();
        payload.append("productionBatchId", String(batchData.id));
        if (remark) payload.append("remark", remark);
        
        payload.append("items", JSON.stringify(payloadItems));
        
        attachments.forEach((file) => {
          payload.append("attachments", file);
        });
      } else {
        payload = {
          productionBatchId: batchData.id,
          items: payloadItems,
          productionOrderId: batchData.productionOrderId || null,
        };
        if (remark) payload.remark = remark;
      }

      console.log("Submitting Material Request with payload:", payload);

      const res = await createMaterialRequest(payload);
      const success = res?.success === 1 || res?.settings?.success === 1;

      if (success) {
        toast.success(
          res?.message ||
            res?.settings?.message ||
            "Material Request created successfully.",
        );
        router.push(
          buildRoute("production-batch", "detail", { id: batchData.id }),
        );
        router.refresh();
      } else {
        const errorText =
          res?.message ||
          res?.settings?.message ||
          "Failed to create Material Request.";
        toast.error(errorText);
        setErrorMsg(errorText);
      }
    } catch (err) {
      const errorText = err.message || "An unexpected error occurred.";
      toast.error(errorText);
      setErrorMsg(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setConfirmModal({ isOpen: true, type: "discard", data: null });
  };

  const executeDiscard = () => {
    setConfirmModal({ isOpen: false, type: "", data: null });
    if (batchData?.id) {
      router.push(
        buildRoute("production-batch", "detail", { id: batchData.id }),
      );
    } else {
      router.back();
    }
  };

  const formatDecimal = (num) => {
    return formatNumber(num);
  };

  return (
    <div className="px-10 py-4 h-full overflow-y-scroll relative">
      {isSubmitting && <Loader overlay />}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4 mb-6">
        <h2 className="text-[18px] font-bold text-gray-900 font-mono tracking-tight">
          {batchData?.batchCode}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          <div>
            <p className="text-[12px] font-medium text-gray-400">Item Name</p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.itemId ? (
                <ModuleLink
                  moduleName="Item"
                  id={batchData?.itemId}
                  className="font-semibold text-[#1565c0] hover:underline"
                  onOpenDrawer={handleOpenDrawer}
                >
                  {batchData?.itemName}
                </ModuleLink>
              ) : (
                displayFormat(batchData?.itemName)
              )}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-400">
              Bill of Material
            </p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.bomId ? (
                <ModuleLink
                  moduleName="Bom"
                  id={batchData.bomId}
                  className="font-semibold text-[#1565c0] hover:underline"
                  onOpenDrawer={handleOpenDrawer}
                >
                  {batchData?.bomName}
                </ModuleLink>
              ) : (
                displayFormat(batchData?.bomName)
              )}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-400">
              Process Template
            </p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.processTemplateId ? (
                <ModuleLink
                  moduleName="ProcessTemplate"
                  id={batchData.processTemplateId}
                  className="font-semibold text-[#1565c0] hover:underline"
                  onOpenDrawer={handleOpenDrawer}
                >
                  {batchData?.processTemplateName}
                </ModuleLink>
              ) : (
                displayFormat(batchData?.processTemplateName)
              )}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6"
      >
        <h3 className="text-[16px] font-bold text-gray-900 pb-2 border-b border-gray-100">
          Item Details
        </h3>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              Remark :
            </label>
            <textarea
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter remarks or special instructions..."
              className="w-full rounded-lg border border-gray-300 p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1565c0]/20 focus:border-[#1565c0] resize-none bg-gray-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">
              Attachments :
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() =>
                !isUploading &&
                document.getElementById("mr-form-file-input")?.click()
              }
              className={`relative border-2 border-dashed border-[#1565c0] rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/50 transition relative min-h-[110px] ${
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
                id="mr-form-file-input"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg,image/webp"
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

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">Item Name</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4 text-right">Available Unit(s)</th>
                <th className="py-3 px-4 text-right">Suggested Qty</th>
                <th className="py-3 px-4 text-center w-48">Required Qty *</th>
                <th className="py-3 px-4 text-right">Required Unit(s)</th>
                <th className="py-3 px-4 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4">
                    <NoDataMessage moduleName="Material Request Items" />
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.itemId}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <SharedImageZoom
                          id={`mr-item-${item.itemId}`}
                          src={item.itemImageUrl}
                          alt={item.itemName}
                          placeholderText={<Package size={18} />}
                          thumbnailClassName="w-9 h-9 rounded-lg border border-gray-200 shrink-0 object-cover"
                        />
                        <div>
                          <ModuleLink
                            moduleName="Item"
                            id={item.itemId}
                            className="font-semibold text-[#1565c0] hover:underline"
                            onOpenDrawer={handleOpenDrawer}
                          >
                            {item.itemName}
                          </ModuleLink>
                          <p className="text-[11px] text-gray-400 font-mono">
                            ({displayFormat(item.itemCode)})
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                      {item.availableStockFormatted || `${formatDecimal(item.availableQty)} ${item.uomName}`}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                      {item.availableStockFormatted || `${formatDecimal(item.availableQty)} Unit(s)`}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                      {item.suggestedQtyFormatted || `${formatDecimal(item.suggestedQty)} ${item.uomName}`}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#1565c0]/20 focus-within:border-[#1565c0]">
                        <NumericInput
                          maxDecimals={4}
                          min={0}
                          value={item.requestedQty}
                          onChange={(val) =>
                            handleQuantityChange(item.itemId, val)
                          }
                          className="w-full py-1.5 px-3 text-right font-mono text-[14px] font-semibold text-gray-900 focus:outline-none"
                        />
                        <span className="bg-gray-100 text-gray-500 px-3 py-1.5 text-[12px] font-medium border-l border-gray-200 shrink-0">
                          {item.uomName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                      {formatDecimal(item.suggestedQty)} Unit(s)
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.itemId)}
                        title="Remove Item"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[#1565c0] hover:bg-[#0d47a1] text-white text-[14px] font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Request Material"}
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

      <SideDrawer
        open={sideDrawerState.isOpen}
        onClose={() =>
          setSideDrawerState({ isOpen: false, moduleName: null, id: null })
        }
        moduleName={sideDrawerState.moduleName}
        mode="details"
        data={sideDrawerState.id ? { id: sideDrawerState.id } : null}
      />

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
          else if (confirmModal.type === "delete") executeRemoveItem();
        }}
        onCancel={() =>
          setConfirmModal({ isOpen: false, type: "", data: null })
        }
      />
    </div>
  );
}
