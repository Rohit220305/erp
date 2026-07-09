"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CompanyDetailsDrawer({ open, onClose, company }) {
  const router = useRouter();
  const { can } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [delayedCompany, setDelayedCompany] = useState(company);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open && company) {
      setDelayedCompany(company);
      const timerId = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timerId);
    } else if (!open) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setDelayedCompany(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, company]);

  if (!delayedCompany) return null;

  const hasViewPerm = can("COMPANY_VIEW");

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5.5">
          <h2 className="text-xl font-semibold text-[#1565c0]">Company Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 cursor-pointer border border-gray-300 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-72px)] flex-col overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            {delayedCompany.logoUrl ? (
              <img
                src={delayedCompany.logoUrl}
                alt={delayedCompany.companyName}
                className="w-16 h-16 rounded-xl object-cover shadow-sm border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-50 text-[#1565c0] flex items-center justify-center font-bold text-2xl border border-blue-100 shadow-sm">
                {delayedCompany.companyName?.[0] || "C"}
              </div>
            )}
            <div>
              <p className="font-semibold text-lg text-gray-800">
                {delayedCompany.companyName}
              </p>
              <span
                className={`mt-1 inline-block px-3 py-1 rounded-sm text-xs font-semibold ${
                  delayedCompany.status === "Active"
                    ? "bg-[#2ecc71] text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {delayedCompany.status || "Active"}
              </span>
            </div>
          </div>

          {hasViewPerm && (
            <button
              onClick={() => {
                onClose();
                router.push(`/company/${delayedCompany.companyId || delayedCompany.id}`);
              }}
              className="w-full bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-md transition mb-8"
            >
              More Details
            </button>
          )}

          <div className="grid grid-cols-2 gap-y-6 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-400 mb-1">Short Name</p>
              <p className="font-medium">{delayedCompany.shortName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="font-medium truncate" title={delayedCompany.email}>
                {delayedCompany.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Phone</p>
              <p className="font-medium">
                {delayedCompany.phone ? `${delayedCompany.dialCode || ""} ${delayedCompany.phone}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Contact Person</p>
              <p className="font-medium">{delayedCompany.contactPersonName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Legal Name</p>
              <p className="font-medium">{delayedCompany.legalName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Website</p>
              <p className="font-medium truncate" title={delayedCompany.website}>
                {delayedCompany.website || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
