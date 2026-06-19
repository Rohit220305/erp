"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/lib/api/auth-api";
import { Mail, EyeOff, LockKeyhole, LockOpen } from "lucide-react";
import { loginSchema } from "@/lib/validation/login.schema";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const [form, setForm] = useState({ userName: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = loginSchema.safeParse(form);
    if (!validation.success) {
      const fieldErrors = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      // console.log("Submitting login form with data:" , form);
      const response = await loginUser(form);

      if (response?.success === 1 && response?.data) {
        // Store user metadata in context (tokens are httpOnly cookies)
        login(response.data, response.data.token);
        router.push("/");
      } else {
        setServerError(
          response?.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      setServerError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[370px]">
      <h1 className="mb-10 text-2xl font-medium text-black">
        Log in to Production Planning
      </h1>

      {serverError && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="mb-3">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={form.userName}
              onChange={handleChange}
              className={`h-14 w-full rounded-md bg-[#f1f1f1] px-5 pr-12 text-sm outline-none border transition-all
                ${errors.userName ? "border-red-400" : "border-transparent focus:border-[#1565c0]"}`}
            />
            <Mail
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>
          {errors.userName && (
            <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`h-14 w-full rounded-md bg-[#f1f1f1] px-5 pr-12 text-sm outline-none border transition-all
                ${errors.password ? "border-red-400" : "border-transparent focus:border-[#1565c0]"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
            >
              {showPassword ? <LockOpen size={18} /> : <LockKeyhole size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-3 h-14 w-full cursor-pointer rounded-md bg-[#1565c0] text-base font-medium text-white transition hover:bg-[#0f57a8] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
            <input type="checkbox" className="h-4 w-4 cursor-pointer" />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="cursor-pointer text-sm font-semibold text-black hover:text-[#1565c0]"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
}
