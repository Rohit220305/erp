"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { Info, X, FileText } from "lucide-react";
import { getItem } from "@/lib/api/item-api";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";

const PRODUCTION_METHOD_OPTIONS = [
  { label: "Process Manufacturing", value: "process" },
  { label: "Discrete Manufacturing", value: "discrete" },
];

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f8f9fa" : "#ffffff",
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
  clearIndicator: (base) => ({
    ...base,
    cursor: "pointer",
    pointerEvents: "auto",
    padding: "4px",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    cursor: "pointer",
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  }),
});

function FileThumbnailItem({ file, isExisting = false, onRemove }) {
  const fileName = isExisting ? (file.originalFileName || file.fileName || "") : (file.name || "");
  const mimeType = file.type || "";
  const isImage = mimeType.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
  const isPdf = mimeType === "application/pdf" || /\.pdf$/i.test(fileName);

  const [previewSrc, setPreviewSrc] = useState(isExisting ? file.url : null);

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

export default function BomStep1Details({
  formData,
  setFormData,
  errors,
  setErrors,
  companyOptions = [],
  itemOptions = [],
  processTemplateOptions = [],
  newFiles = [],
  setNewFiles,
  existingFiles = [],
  setExistingFiles,
  user = null,
  mode = "create",
  setIsDirty,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [itemPrimitiveQtyDisplay, setItemPrimitiveQtyDisplay] = useState("—");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingFiles, setPendingFiles] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  useEffect(() => {
    if (formData.itemId) {
      getItem({ id: formData.itemId })
        .then((res) => {
          const itemData = res?.data || res?.settings?.data || res;
          if (itemData) {
            const display =
              itemData.primitiveQuantityDisplay ||
              (itemData.primitiveQuantity
                ? `${itemData.primitiveQuantity} ${itemData.itemUomName || itemData.itemUomCode || "Unit(s)"}`
                : "1.00 Unit(s)");
            setItemPrimitiveQtyDisplay(display);
          }
        })
        .catch(() => setItemPrimitiveQtyDisplay("—"));
    } else {
      setItemPrimitiveQtyDisplay("—");
    }
  }, [formData.itemId]);

  useEffect(() => {
    let timer;
    if (isUploading && uploadProgress < 100) {
      timer = setTimeout(() => {
        setUploadProgress((prev) => prev + 25);
      }, 70);
    } else if (isUploading && uploadProgress >= 100) {
      if (pendingFiles) {
        const valid = pendingFiles.filter((f) => f.size <= 100 * 1024 * 1024);
        setNewFiles((prev) => [...prev, ...valid]);
        if (setIsDirty) setIsDirty(true);
      }
      setIsUploading(false);
      setPendingFiles(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isUploading, uploadProgress, pendingFiles, setNewFiles, setIsDirty]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (setIsDirty) setIsDirty(true);

    if (errors && errors[name]) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleNameChange = (value) => {
    setFormData((prev) => ({ ...prev, bomName: value }));
    if (setIsDirty) setIsDirty(true);

    if (errors && errors.bomName) {
      setErrors((prevErrors) => {
        const copy = { ...prevErrors };
        delete copy.bomName;
        return copy;
      });
    }
  };

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
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    if (setIsDirty) setIsDirty(true);
  };

  const removeExistingFile = (id) => {
    setExistingFiles((prev) => prev.filter((f) => f.id !== id));
    if (setIsDirty) setIsDirty(true);
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

  const selectedItem = itemOptions.find((i) => Number(i.value) === Number(formData.itemId));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Row 1: BOM Name & Customer Name */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            BOM Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter BOM Name"
            value={formData.bomName || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full h-[48px] rounded-md border bg-white px-4 text-sm outline-none transition focus:border-[#1565c0]
              ${errors?.bomName ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
          />
          {errors?.bomName && (
            <p className="mt-1 text-xs text-red-500">{errors.bomName}</p>
          )}
        </div>

        {/* <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Customer Name
          </label>
          <Select
            instanceId="select-customer"
            value={null}
            isDisabled={true}
            options={[]}
            placeholder="Select Customer (Module coming soon...)"
            classNamePrefix="react-select"
            styles={customSelectStyles(false, true)}
          />
        </div> */}

        {/* Row 2: Production Method & Item */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Production Method<span className="text-red-500">*</span>
          </label>
          <Select
            instanceId="select-production-method"
            value={
              PRODUCTION_METHOD_OPTIONS.find(
                (e) => e.value === formData.productionMethod,
              ) || null
            }
            onChange={(opt) =>
              handleChange("productionMethod", opt ? opt.value : "")
            }
            options={PRODUCTION_METHOD_OPTIONS}
            isClearable={true}
            isSearchable={false}
            placeholder="Select Production Method"
            classNamePrefix="react-select"
            styles={customSelectStyles(errors?.productionMethod)}
          />
          {errors?.productionMethod && (
            <p className="mt-1 text-xs text-red-500">
              {errors.productionMethod}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Item<span className="text-red-500">*</span>
          </label>
          <Select
            instanceId="select-output-item"
            value={selectedItem || null}
            onChange={(opt) => handleChange("itemId", opt ? opt.value : "")}
            options={itemOptions}
            isClearable={true}
            isSearchable={true}
            placeholder="Select Item"
            classNamePrefix="react-select"
            styles={customSelectStyles(errors?.itemId)}
          />
          {errors?.itemId && (
            <p className="mt-1 text-xs text-red-500">{errors.itemId}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Primitive Qty
          </label>
          <div className="h-[48px] rounded-md border border-gray-200 bg-gray-50 px-4 flex items-center text-sm font-medium text-gray-700">
            {itemPrimitiveQtyDisplay}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Process Template<span className="text-red-500">*</span>
          </label>
          <Select
            instanceId="select-process-template"
            value={
              processTemplateOptions.find(
                (p) => Number(p.value) === Number(formData.processTemplateId),
              ) || null
            }
            onChange={(opt) =>
              handleChange("processTemplateId", opt ? opt.value : "")
            }
            options={processTemplateOptions}
            isClearable={true}
            isSearchable={true}
            placeholder="Select Process Template"
            classNamePrefix="react-select"
            styles={customSelectStyles(errors?.processTemplateId)}
          />
          {errors?.processTemplateId && (
            <p className="mt-1 text-xs text-red-500">
              {errors.processTemplateId}
            </p>
          )}
        </div>

        {/* Row 4: Remarks & Attachment */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Remarks
          </label>
          <div className="relative">
            <textarea
              placeholder="Enter Remarks"
              value={formData.remarks || ""}
              onChange={(e) => handleChange("remarks", e.target.value)}
              className={`w-full h-[48px] rounded-md border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1565c0] pr-10 resize-none
                ${errors?.remarks ? "border-red-500 bg-red-50" : "border-gray-300"}
              `}
            />
            <div className="absolute top-3.5 right-3 group flex items-center">
              <Info
                size={18}
                className="text-gray-400 cursor-pointer hover:text-gray-600"
              />
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                Please enter Remarks if any.
              </div>
            </div>
          </div>
          {errors?.remarks && (
            <p className="mt-1 text-xs text-red-500">{errors.remarks}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Reference Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter Reference Number"
              value={formData.referenceNumber || ""}
              onChange={(e) => handleChange("referenceNumber", e.target.value)}
              className={`w-full h-[48px] rounded-md border bg-white px-4 text-sm outline-none transition focus:border-[#1565c0] pr-10
                ${errors?.referenceNumber ? "border-red-500 bg-red-50" : "border-gray-300"}
              `}
            />
            <div className="absolute top-3.5 right-3 group flex items-center">
              <Info
                size={18}
                className="text-gray-400 cursor-pointer hover:text-gray-600"
              />
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-3 leading-relaxed">
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-[#1565c0]"></div>
                Please enter Reference Number if any.
              </div>
            </div>
          </div>
          {errors?.referenceNumber && (
            <p className="mt-1 text-xs text-red-500">
              {errors.referenceNumber}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Attachment
          </label>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() =>
              !isUploading &&
              document.getElementById("bom-form-file-input")?.click()
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
              id="bom-form-file-input"
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

          {/* Uploaded Files Square Thumbnail Cards Grid with SharedImageZoom */}
          {(existingFiles.length > 0 || newFiles.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {existingFiles.map((file) => (
                <FileThumbnailItem
                  key={file.id}
                  file={file}
                  isExisting={true}
                  onRemove={() => setDeleteConfirmTarget({ type: "existing", id: file.id })}
                />
              ))}

              {newFiles.map((file, idx) => (
                <FileThumbnailItem
                  key={`new-${idx}`}
                  file={file}
                  isExisting={false}
                  onRemove={() => setDeleteConfirmTarget({ type: "new", id: idx })}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-700">
            Status<span className="text-red-500">*</span>
          </label>
          <Select
            instanceId="select-status"
            value={
              STATUS_OPTIONS.find((s) => s.value === formData.status) || null
            }
            onChange={(opt) => handleChange("status", opt ? opt.value : "")}
            options={STATUS_OPTIONS}
            isClearable={true}
            isSearchable={false}
            placeholder="Select Status"
            classNamePrefix="react-select"
            styles={customSelectStyles(errors?.status)}
          />
          {errors?.status && (
            <p className="mt-1 text-xs text-red-500">{errors.status}</p>
          )}
        </div>

        {/* Row 6: Company (Super Admin) */}
        {user?.isSuperAdmin && (
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-700">
              Company<span className="text-red-500">*</span>
            </label>
            <Select
              instanceId="select-company"
              value={
                companyOptions.find(
                  (c) => Number(c.value) === Number(formData.companyId),
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
              styles={customSelectStyles(errors?.companyId, mode === "edit")}
            />
            {errors?.companyId && (
              <p className="mt-1 text-xs text-red-500">{errors.companyId}</p>
            )}
          </div>
        )}
      </div>

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
