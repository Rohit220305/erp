"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function UserDetailsDrawer({ open, onClose, user }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [delayedUser, setDelayedUser] = useState(user);
  const [imgError, setImgError] = useState(false);
  const { can } = useAuth();

  const userId = user?.userId || user?.id;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    async function loadUser() {
      if (!userId) return;
      try {
        const { getUser } = await import("@/lib/api/user-api");
        const res = await getUser(userId);
        if (
          res &&
          res.firstName &&
          res.success !== 0 &&
          res.settings?.success !== 0
        ) {
          setDelayedUser(res);
          setImgError(false); // ← reset error state for the newly loaded user
        } else {
          setDelayedUser(null);
        }
      } catch (err) {
        console.error("Failed to load user details in drawer", err);
        setDelayedUser(null);
      }
    }

    if (open && user) {
      loadUser();
      const timerId = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timerId);
    } else if (!open) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setDelayedUser(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, user, userId]);

  if (!delayedUser) return null;
  const hasDetailsPermission = can("USER_VIEW");
  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${isVisible ? "pointer-events-auto" : "pointer-events-none"
        }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5.5">
          <h2 className="text-xl font-semibold text-[#1565c0]">User</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 cursor-pointer border border-gray-300 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex h-[calc(100%-72px)] flex-col overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            {delayedUser.photoUrl && !imgError ? (
              <img
                src={delayedUser.photoUrl}
                alt="Updated by"
                onError={() => setImgError(true)}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-xs border border-gray-200">
                {delayedUser?.firstName?.[0]}{
                  delayedUser?.lastName?.[0]}
              </div>
            )}
            <div>
              <p className="font-semibold text-lg text-gray-800">
                {delayedUser.firstName} {delayedUser.lastName}
              </p>
              <span
                className={`mt-1 inline-block px-3 py-1 rounded-sm text-xs font-semibold ${delayedUser.status === "Active"
                    ? "bg-[#2ecc71] text-white"
                    : "bg-red-500 text-white"
                  }`}
              >
                {delayedUser.status}
              </span>
            </div>
          </div>

          {hasDetailsPermission && (
            <button
              onClick={() => {
                onClose();
                router.push(`/admin/${delayedUser.id}`);
              }}
              className="w-full bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-800 font-medium py-2.5 rounded-md transition mb-8"
            >
              More Details
            </button>
          )}

          <div className="grid grid-cols-2 gap-y-6 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="font-medium truncate" title={delayedUser.email}>
                {delayedUser.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Phone</p>
              <p className="font-medium">
                {delayedUser.phone
                  ? `${delayedUser.dialCode || ""} ${delayedUser.phone}`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Group</p>
              <p className="font-medium text-gray-800">
                {delayedUser.groupName || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Company</p>
              <p className="font-medium text-[#1565c0]">
                {delayedUser.companyName || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Added Date</p>
              <p className="font-medium">
                {delayedUser.addedDateFormatted || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Updated Date</p>
              <p className="font-medium">
                {delayedUser.updatedDateFormatted || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
