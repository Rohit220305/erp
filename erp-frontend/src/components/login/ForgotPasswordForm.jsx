"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, LockKeyhole, LockOpen, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword, verifyOtp, resetPasswordOtp } from "@/lib/api/auth-api";
import { resetPasswordSchema } from "@/lib/validation/reset-password.schema";

export default function ForgotPasswordForm() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setErrors({ email: "Email is required" });
      return;
    }
    setLoading(true);
    try {
      const response = await forgotPassword({ email: form.email });
      if (response?.success === 1) {
        toast.success(response.message || "OTP sent successfully.");
        setStep(2);
      } else {
        toast.error(response?.message || "Failed to send OTP.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtp({ email: form.email, otp: form.otp });
      if (response?.success === 1) {
        setStep(3);
      } else {
        toast.error(response?.message || "Invalid OTP.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const validation = resetPasswordSchema.safeParse({
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });

    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordOtp({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      if (response?.success === 1) {
        toast.success("Password reset successfully. Redirecting to login...");
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(response?.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[370px]">
      <button
        onClick={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            router.push("/login");
          }
        }}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-black cursor-pointer transition-colors"
      >
        <ArrowLeft size={16} />
        {step > 1 ? "Back" : "Back to Login"}
      </button>

      <h1 className="mb-8 text-2xl font-medium text-black">
        {step === 1 && "Forgot Password"}
        {step === 2 && "Enter OTP"}
        {step === 3 && "Reset Password"}
      </h1>

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div className="mb-3">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className={`h-14 w-full rounded-md bg-[#f1f1f1] px-5 pr-12 text-sm outline-none border transition-all
                  ${errors.email ? "border-red-400" : "border-transparent focus:border-[#1565c0]"}`}
              />
              <Mail
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-14 w-full cursor-pointer rounded-md bg-[#1565c0] text-base font-medium text-white transition hover:bg-[#0f57a8] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* Step 2: OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifsetStepyOtp}>
          <div className="mb-4 text-sm text-gray-600">
            Please enter the 6-digit OTP sent to{" "}
            <span className="font-semibold text-black">{form.email}</span>.
          </div>
          <div className="mb-3">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              OTP
            </label>
            <div className="relative">
              <input
                type="text"
                name="otp"
                maxLength={6}
                placeholder="000000"
                value={form.otp}
                onChange={handleChange}
                className={`h-14 w-full rounded-md bg-[#f1f1f1] px-5 pr-12 text-sm outline-none border transition-all tracking-widest
                  ${errors.otp ? "border-red-400" : "border-transparent focus:border-[#1565c0]"}`}
              />
              <KeyRound
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 h-14 w-full cursor-pointer rounded-md bg-[#1565c0] text-base font-medium text-white transition hover:bg-[#0f57a8] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <div className="mb-3">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                className={`h-14 w-full rounded-md bg-[#f1f1f1] px-5 pr-12 text-sm outline-none border transition-all
                  ${errors.newPassword ? "border-red-400" : "border-transparent focus:border-[#1565c0]"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword ? (
                  <LockOpen size={18} />
                ) : (
                  <LockKeyhole size={18} />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`h-14 w-full rounded-md bg-[#f1f1f1] px-5 pr-12 text-sm outline-none border transition-all
                  ${errors.confirmPassword ? "border-red-400" : "border-transparent focus:border-[#1565c0]"}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showConfirmPassword ? (
                  <LockOpen size={18} />
                ) : (
                  <LockKeyhole size={18} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || isSuccess}
            className="mt-5 h-14 w-full cursor-pointer rounded-md bg-[#1565c0] text-base font-medium text-white transition hover:bg-[#0f57a8] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? "Resetting..."
              : isSuccess
                ? "Redirecting..."
                : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
