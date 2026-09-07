"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function DeleteConfirmModal({
  isOpen,
  title = "Delete",
  message = "Are you sure want to delete this?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && onCancel && onCancel();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      <div className="relative z-10 bg-white rounded-md shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in-0 zoom-in-95 border border-gray-100">
        <div className="bg-[#1565c0] px-4 py-2.5 flex items-center justify-between text-white">
          <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/80 hover:text-white transition cursor-pointer p-0.5"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 text-center">
          <p className="text-xs sm:text-sm text-gray-700 font-normal mb-6">
            {message}
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onConfirm}
              className="px-7 py-2.5 bg-[#1565c0] text-white text-sm font-semibold rounded-md hover:bg-[#0d47a1] transition cursor-pointer shadow-xs min-h-[40px] flex items-center justify-center"
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-7 py-2.5 bg-[#1565c0] text-white text-sm font-semibold rounded-md hover:bg-[#0d47a1] transition cursor-pointer shadow-xs min-h-[40px] flex items-center justify-center"
            >
              {cancelLabel}
            </button>
          </div>
        </div>

        <div className="absolute bottom-1 right-1 pointer-events-none opacity-40">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M7 1L1 7M7 4L4 7M7 7" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>,
    document.body
  );
}
