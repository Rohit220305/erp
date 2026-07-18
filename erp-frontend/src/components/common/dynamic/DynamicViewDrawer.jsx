"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DynamicViewDrawer({ open, onClose, item, schema, fetchItem }) {
  const router = useRouter();
  const { can } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [delayedItem, setDelayedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const itemId = item?.id;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    async function loadItemDetails() {
      if (!itemId) return;

      if (!fetchItem) {
        // No fetchItem provided — use the row data directly from the listing
        setDelayedItem(item);
        return;
      }

      try {
        setLoading(true);
        const res = await fetchItem({ id: itemId });
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setDelayedItem(res.data || res.settings?.data || item);
        } else {
          setDelayedItem(item);
        }
      } catch (err) {
        console.error("Failed to load details in drawer", err);
        setDelayedItem(item);
      } finally {
        setLoading(false);
      }
    }

    if (open && item) {
      loadItemDetails();
      const timerId = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timerId);
    } else if (!open) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setDelayedItem(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, item, itemId, schema]);

  if (loading) {
    return (
      <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isVisible ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div onClick={onClose} className="absolute inset-0 bg-black/30" />
        <div className="absolute right-0 top-0 h-full w-full max-w-[380px] bg-white p-6 flex flex-col justify-center items-center shadow-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!delayedItem) return null;

  const viewPermission = schema.actions?.viewPermission;
  const hasViewPerm = !viewPermission || can(viewPermission);

  const viewFields = (schema.viewFields || schema.fields || []).filter(
    (field) => !(field.hiddenIn && field.hiddenIn.includes("view"))
  );

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isVisible ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      />

      <div className={`absolute right-0 top-0 h-full w-full max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-xl font-semibold text-blue-700">{schema.title || "Details"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 cursor-pointer border border-gray-300 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex h-[calc(100%-72px)] flex-col overflow-y-auto px-6 py-6">
          
          <div className="mb-6 border-b border-gray-100 pb-4">
             <p className="font-semibold text-lg text-gray-800">
                {delayedItem[schema.primaryTitleField || 'name'] || delayedItem.companyName || delayedItem.currencyName || "Record Details"}
             </p>
             {delayedItem.status && (
               <span
                 className={`mt-2 inline-block px-3 py-1 rounded-sm text-xs font-semibold ${
                   delayedItem.status === "Active"
                     ? "bg-green-500 text-white"
                     : "bg-red-500 text-white"
                 }`}
               >
                 {delayedItem.status}
               </span>
             )}
          </div>

          {hasViewPerm && schema.actions?.viewRedirectPath && (
            <button
              onClick={() => {
                onClose();
                let path = schema.actions.viewRedirectPath;
                if (path.includes("{id}")) path = path.replace("{id}", delayedItem.id);
                router.push(path);
              }}
              className="w-full bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-md transition mb-8"
            >
              More Details
            </button>
          )}

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm text-gray-600">
            {viewFields.map((field) => (
              <div key={field.key} className={field.fullWidth ? "col-span-2" : "col-span-1"}>
                <p className="text-xs text-gray-400 mb-1">{field.label}</p>
                <p className="font-medium break-words">
                  {delayedItem[field.key] !== null && delayedItem[field.key] !== undefined && delayedItem[field.key] !== "" 
                    ? String(delayedItem[field.key]) 
                    : "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
