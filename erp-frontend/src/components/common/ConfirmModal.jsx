"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const ACTION_DEFAULTS = {
  create: (entity) => ({
    title: "Confirm Creation",
    message: `Are you sure you want to create this ${entity || "record"}?`,
    confirmLabel: "Create",
    danger: false,
  }),
  update: (entity) => ({
    title: "Confirm Update",
    message: `Are you sure you want to save changes to this ${entity || "record"}?`,
    confirmLabel: "Save",
    danger: false,
  }),
  delete: (entity) => ({
    title: "Confirm Delete",
    message: `Are you sure you want to delete this ${entity || "record"}?`,
    confirmLabel: "Delete",
    danger: true,
  }),
  discard: (entity) => ({
    title: "Discard Changes",
    message: entity
      ? `Are you sure you want to discard your changes for this ${entity}? .`
      : "Are you sure you want to discard your changes?",
    confirmLabel: "Discard",
    danger: true,
  }),
  switch: (entity) => ({
    title: "Confirm Profile Switch",
    message: `Are you sure you want to switch profile to ${entity || "this profile"}?`,
    confirmLabel: "Switch",
    danger: false,
  }),
};

export default function ConfirmModal({
  isOpen,
  actionType,
  entityName,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger,
  variant,
}) {
  const confirmRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onCancel]);
  useEffect(() => {
    setMounted(true);
    if (isOpen) confirmRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const preset = actionType && ACTION_DEFAULTS[actionType]
    ? ACTION_DEFAULTS[actionType](entityName)
    : null;

  const finalTitle = title ?? preset?.title ?? "Confirm Action";
  const finalMessage = message ?? preset?.message ?? "Are you sure you want to proceed?";
  const finalConfirmLabel = confirmLabel ?? preset?.confirmLabel ?? "Confirm";

  let isDanger = preset ? preset.danger : true;
  if (danger !== undefined) {
    isDanger = Boolean(danger);
  } else if (variant) {
    isDanger = variant === "danger";
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-5 animate-in fade-in-0 zoom-in-95 flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center justify-center gap-3 mb-4 w-full">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDanger ? "bg-red-100" : "bg-blue-100"
              }`}
          >
            <AlertTriangle
              size={20}
              className={isDanger ? "text-red-600" : "text-blue-600"}
            />
          </div>
          <h3 className="text-base font-semibold text-gray-900">{finalTitle}</h3>
        </div>


        <div className="max-h-32 overflow-y-auto mb-6 w-full px-2 custom-scrollbar">
          <p className="text-sm text-gray-500 leading-relaxed">{finalMessage}</p>
        </div>

        <div className="flex gap-3 justify-center w-full">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition cursor-pointer min-w-[100px]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition cursor-pointer min-w-[100px] ${isDanger
              ? "bg-red-600 hover:bg-red-700"
              : "bg-[#1565c0] hover:bg-[#0f57a6]"
              }`}
          >
            {finalConfirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
