"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { loginUser, selectProfile } from "@/lib/api/auth-api";
import { Mail, LockKeyhole, LockOpen, ArrowLeft, ArrowRight, Star } from "lucide-react";
import toast from "react-hot-toast";
import { loginSchema } from "@/lib/validation/login.schema";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({ userName: "", password: "" });
  const [selectionData, setSelectionData] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
      const response = await loginUser(form);

      if (response?.success === 1 && response?.data) {
        if (response.data.requiresProfileSelection) {
          setSelectionData(response.data);
          const primary = response.data.profiles?.find((p) => p.isPrimary);
          if (primary) {
            setSelectedGroupId(primary.groupId);
          } else if (response.data.profiles?.length > 0) {
            setSelectedGroupId(response.data.profiles[0].groupId);
          }
          toast.success("Please select a profile to continue");
          setStep(2);
        } else {
          toast.success(response.message || "Login successful");
          login(response.data, response.data.token);
          router.push("/");
        }
      } else {
        toast.error(
          response?.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfileSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroupId || !selectionData?.selectionToken) {
      toast.error("Please select a profile");
      return;
    }

    try {
      setLoading(true);
      const res = await selectProfile(
        selectionData.selectionToken,
        selectedGroupId
      );

      if (res?.success === 1 && res?.data) {
        toast.success(res.message || "Login successful");
        login(res.data, res.data.token);
        router.push("/");
      } else {
        toast.error(res?.message || "Failed to select profile");
      }
    } catch (err) {
      toast.error(err?.message || "Session expired or invalid. Please log in again.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[370px]">
      {step === 1 && (
        <>
          <h1 className="mb-10 text-2xl font-medium text-black">
            Log in to Production Planning
          </h1>

          <form onSubmit={handleSubmit}>
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
                  {showPassword ? (
                    <LockOpen size={18} />
                  ) : (
                    <LockKeyhole size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 h-14 w-full cursor-pointer rounded-md bg-[#1565c0] text-base font-medium text-white transition hover:bg-white hover:text-[#1565c0] border-1 hover:border-[#1565c0] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging In..." : "Login"}
            </button>
            <div className="mt-7 flex items-center">
              <Link
                href="/forgot-password"
                className="cursor-pointer text-sm font-semibold text-black hover:text-[#1565c0]"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mb-6 flex items-center gap-2 text-sm text-gray-600 hover:text-black cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </button>

          <h1 className="mb-2 text-2xl font-medium text-black">
            Select Profile
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Welcome back! Please choose a profile you want to access.
          </p>

          <form onSubmit={handleSelectProfileSubmit}>
            <div className="space-y-3 mb-6">
              {selectionData?.profiles?.map((profile) => {
                const isSelected = selectedGroupId === profile.groupId;
                return (
                  <div
                    key={profile.groupId}
                    onClick={() => setSelectedGroupId(profile.groupId)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      isSelected
                        ? "border-[#1565c0] bg-blue-50/60 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? "bg-[#1565c0] text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {profile.groupName?.[0] || "P"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 text-sm">
                            {profile.groupName}
                          </p>
                          {profile.isPrimary && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-blue-100 text-[#1565c0] px-1.5 py-0.5 rounded-full">
                              <Star size={9} className="fill-[#1565c0]" />{" "}
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="profileSelect"
                        checked={isSelected}
                        onChange={() => setSelectedGroupId(profile.groupId)}
                        className="h-4 w-4 text-[#1565c0] cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedGroupId}
              className="h-14 w-full cursor-pointer rounded-md bg-[#1565c0] text-base font-medium text-white transition hover:bg-[#0f57a8] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Entering ERP..."
              ) : (
                <>
                  <span>Continue with Selected Profile</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
