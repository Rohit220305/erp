"use client";

import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { resetPasswordAsAdmin } from "@/lib/api/auth-api";
import toast from "react-hot-toast";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ResetPasswordDrawer({ open, onClose, user }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [delayedUser, setDelayedUser] = useState(user);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (open && user) {
      setDelayedUser(user);
      setNewPassword("");
      setConfirmPassword("");
      setNewPasswordError("");
      setConfirmPasswordError("");
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      const timerId = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timerId);
    } else if (!open) {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setDelayedUser(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, user]);

  if (!delayedUser) return null;

  const handleUpdate = async () => {
    setNewPasswordError("");
    setConfirmPasswordError("");

    const result = resetPasswordSchema.safeParse({
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setNewPasswordError(errors.newPassword?.[0] || "");
      setConfirmPasswordError(errors.confirmPassword?.[0] || "");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordAsAdmin(delayedUser.id, newPassword);
      if (res?.success === 1 || res?.settings?.success === 1) {
        toast.success(res?.message || "Password updated successfully");
        onClose();
      } else {
        toast.error(res?.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("Failed to update password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-md border bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#1565c0] focus:bg-white pr-20";
  const errorBorder = "border-red-400 focus:border-red-500";
  const normalBorder = "border-gray-200";

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${
        isVisible ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
      > 
        <div className="flex items-center justify-between border-b border-gray-300 px-6 py-5.5">
          <h2 className="text-xl font-semibold text-[#1565c0]">
            Reset Password
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 cursor-pointer border border-gray-300 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex h-[calc(100%-72px)] flex-col px-6 py-6">
          <div className="flex-1">
            <div className="mb-5">
              <label className="mb-2 block text-sm text-gray-700">
                New Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (newPasswordError) setNewPasswordError("");
                  }}
                  className={`${inputBase} ${newPasswordError ? errorBorder : normalBorder}`}
                />
                
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPasswordError ? (
                <p className="mt-1 text-xs text-red-500">{newPasswordError}</p>
              ) : null}
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm text-gray-700">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) setConfirmPasswordError("");
                  }}
                  className={`${inputBase} ${confirmPasswordError ? errorBorder : normalBorder}`}
                />
                
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {confirmPasswordError ? (
                <p className="mt-1 text-xs text-red-500">
                  {confirmPasswordError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center pt-4">
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="bg-[#1565c0] cursor-pointer hover:bg-[#0f57a6] text-white px-6 py-2.5 rounded-md font-medium transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              onClick={onClose}
              className="border border-[#1565c0] cursor-pointer text-[#1565c0] hover:bg-blue-50 px-6 py-2.5 rounded-md font-medium transition"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
