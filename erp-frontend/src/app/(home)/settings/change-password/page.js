"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { changePassword } from "@/lib/api/auth-api";
import { useHeader } from "@/context/HeaderContext";
import { Eye, EyeOff, Lock, ShieldCheck, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect } from "react";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string() 
      .min(1, "Current password is required")
      .min(6, "Password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters")
     
    ,
    confirmPassword: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function PasswordField({ label, name, register, error, show, onToggle, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
            error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
          }`}
          {...register(name)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { setConfig, resetConfig } = useHeader();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: [],
        showBookmark: false,
        showLanguage: false,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Change Password",
        breadcrumbs: [
          { label: "Home", href: "/" },
          { label: "Change Password" },
        ],
      },
    });
    return () => resetConfig();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (res?.success === 1) {
        toast.success("Password changed successfully!");
        reset();
        router.push("/");
      } else {
        toast.error(res?.message || "Failed to change password");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565c0]">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Change Password</h1>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-xl p-6 shadow-sm space-y-5 border border-gray-100"
      >
        {/* Security notice */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <ShieldCheck size={18} className="text-[#1565c0] mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Use a strong password with at least 6 characters.
          </p>
        </div>

        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            register={register}
            error={errors.currentPassword?.message}
            show={show.current}
            onToggle={() => toggleShow("current")}
            placeholder="Enter your current password"
          />
          <PasswordField
            label="New Password"
            name="newPassword"
            register={register}
            error={errors.newPassword?.message}
            show={show.newPwd}
            onToggle={() => toggleShow("newPwd")}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            register={register}
            error={errors.confirmPassword?.message}
            show={show.confirm}
            onToggle={() => toggleShow("confirm")}
            placeholder="Re-enter new password"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center border-t pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          {/* <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Clear
          </button> */}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#1565c0] text-white rounded-lg text-sm font-medium hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-2"
          >
            <Lock size={15} />
            {loading ? "Updating..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
