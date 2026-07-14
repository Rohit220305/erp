// "use client";

// import { useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { changePassword } from "@/lib/api/auth-api";
// import { Eye, EyeOff, Lock, ShieldCheck, KeyRound } from "lucide-react";
// import toast from "react-hot-toast";
// import ConfirmModal from "@/components/common/ConfirmModal";

// const changePasswordSchema = z
//   .object({
//     currentPassword: z
//       .string()
//       .min(1, "Current password is required")
//       .min(6, "Password must be at least 6 characters"),
//     newPassword: z
//       .string()
//       .min(1, "New password is required")
//       .min(6, "Password must be at least 6 characters"),
//     confirmPassword: z
//       .string()
//       .min(1, "Please confirm your new password"),
//   })
//   .refine((data) => data.newPassword === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// function PasswordField({ label, name, register, error, show, onToggle, placeholder }) {
//   return (
//     <div className="space-y-1">
//       <label className="block text-sm font-medium text-gray-700">
//         {label} <span className="text-red-500">*</span>
//       </label>
//       <div className="relative">
//         <input
//           type={show ? "text" : "password"}
//           placeholder={placeholder}
//           className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
//             error ? "border-red-400" : "border-gray-300 focus:border-[#1565c0]"
//           }`}
//           {...register(name)}
//         />
//         <button
//           type="button"
//           onClick={onToggle}
//           className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 cursor-pointer transition"
//         >
//           {show ? <EyeOff size={16} /> : <Eye size={16} />}
//         </button>
//       </div>
//       {error && <p className="text-xs text-red-500">{error}</p>}
//     </div>
//   );
// }

// export default function ChangePasswordForm() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const [formData, setFormData] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(changePasswordSchema),
//     defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
//     mode: "onBlur",
//   });

//   const onFormSubmit = (data) => {
//     setFormData(data);
//     setConfirmOpen(true);
//   };

//   const handleActualSubmit = useCallback(async (data) => {
//     try {
//       setLoading(true);
//       const res = await changePassword({
//         currentPassword: data.currentPassword,
//         newPassword: data.newPassword,
//         confirmPassword: data.confirmPassword,
//       });

//       if (res?.success === 1) {
//         toast.success("Password changed successfully!");
//         reset();
//         router.push("/");
//       } else {
//         toast.error(res?.message || "Failed to change password");
//       }
//     } catch (err) {
//       toast.error(err?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }, [router, reset]);

//   const toggleShow = (field) =>
//     setShow((prev) => ({ ...prev, [field]: !prev[field] }));

//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <div className="mb-6 flex items-center gap-3">
//         <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565c0]">
//           <KeyRound size={20} />
//         </div>
//         <div>
//           <h1 className="text-lg font-semibold text-gray-900">Change Password</h1>
//           <p className="text-sm text-gray-500">Update your account password</p>
//         </div>
//       </div>

//       <form
//         onSubmit={handleSubmit(onFormSubmit)}
//         className="bg-white rounded-xl p-6 shadow-sm space-y-5 border border-gray-100"
//       >
//         <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
//           <ShieldCheck size={18} className="text-[#1565c0] mt-0.5 shrink-0" />
//           <p className="text-xs text-blue-700 leading-relaxed">
//             Use a strong password with at least 6 characters.
//           </p>
//         </div>

//         <div className="space-y-4">
//           <PasswordField
//             label="Current Password"
//             name="currentPassword"
//             register={register}
//             error={errors.currentPassword?.message}
//             show={show.current}
//             onToggle={() => toggleShow("current")}
//             placeholder="Enter your current password"
//           />
//           <PasswordField
//             label="New Password"
//             name="newPassword"
//             register={register}
//             error={errors.newPassword?.message}
//             show={show.newPwd}
//             onToggle={() => toggleShow("newPwd")}
//             placeholder="Enter new password"
//           />
//           <PasswordField
//             label="Confirm New Password"
//             name="confirmPassword"
//             register={register}
//             error={errors.confirmPassword?.message}
//             show={show.confirm}
//             onToggle={() => toggleShow("confirm")}
//             placeholder="Re-enter new password"
//           />
//         </div>

//         <div className="flex gap-3 justify-center border-t pt-4">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-6 py-2 bg-[#1565c0] text-white rounded-lg text-sm font-medium hover:bg-[#0f57a6] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-2"
//           >
//             <Lock size={15} />
//             {loading ? "Updating..." : "Submit"}
//           </button>
//         </div>
//       </form>

//       <ConfirmModal
//         isOpen={confirmOpen}
//         title="Confirm Password Change"
//         message="Are you sure you want to change your password? You will need to use your new password next time you log in."
//         confirmLabel="Confirm"
//         onConfirm={() => {
//           setConfirmOpen(false);
//           if (formData) {
//             handleActualSubmit(formData);
//           }
//         }}
//         onCancel={() => {
//           setConfirmOpen(false);
//           setFormData(null);
//         }}
//       />
//     </div>
//   );
// }

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { changePassword } from "@/lib/api/auth-api";
import { Eye, EyeOff, Lock, ShieldCheck, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/common/ConfirmModal";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .min(6, "Password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({
    current: false,
    newPwd: false,
    confirm: false,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const result = changePasswordSchema.safeParse(values);
    if (!result.success) {
      const fieldError = result.error.issues.find(
        (issue) => issue.path[0] === name,
      );
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [name]: fieldError.message }));
      }
    }
  };

  const validate = () => {
    const result = changePasswordSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFormData(values);
    setConfirmOpen(true);
  };

  const handleActualSubmit = useCallback(
    async (data) => {
      try {
        setLoading(true);
        const res = await changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        });

        if (res?.success === 1) {
          toast.success("Password changed successfully!");
          setValues(initialValues);
          setErrors({});
          router.push("/");
        } else {
          toast.error(res?.message || "Failed to change password");
        }
      } catch (err) {
        toast.error(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1565c0]">
          <KeyRound size={20} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Change Password
          </h1>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </div>

      <form
        onSubmit={onFormSubmit}
        className="bg-white rounded-xl p-6 shadow-sm space-y-5 border border-gray-100"
      >
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <ShieldCheck size={18} className="text-[#1565c0] mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Use a strong password with at least 6 characters.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.current ? "text" : "password"}
                name="currentPassword"
                placeholder="Enter your current password"
                value={values.currentPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
                  errors.currentPassword
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#1565c0]"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow("current")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 cursor-pointer transition"
              >
                {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.newPwd ? "text" : "password"}
                name="newPassword"
                placeholder="Enter new password"
                value={values.newPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
                  errors.newPassword
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#1565c0]"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow("newPwd")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 cursor-pointer transition"
              >
                {show.newPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.confirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20 ${
                  errors.confirmPassword
                    ? "border-red-400"
                    : "border-gray-300 focus:border-[#1565c0]"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleShow("confirm")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 cursor-pointer transition"
              >
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-center border-t pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
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

      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm Password Change"
        message="Are you sure you want to change your password? You will need to use your new password next time you log in."
        confirmLabel="Confirm"
        onConfirm={() => {
          setConfirmOpen(false);
          if (formData) {
            handleActualSubmit(formData);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setFormData(null);
        }}
      />
    </div>
  );
}