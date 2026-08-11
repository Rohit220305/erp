"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = true,
}) {
  const confirmRef = useRef(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) confirmRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in-0 zoom-in-95">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            danger ? "bg-red-100" : "bg-blue-100"
          }`}
        >
          <AlertTriangle
            size={24}
            className={danger ? "text-red-600" : "text-blue-600"}
          />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition cursor-pointer ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#1565c0] hover:bg-[#0f57a6]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
