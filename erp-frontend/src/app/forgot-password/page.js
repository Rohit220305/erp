import ForgotPasswordForm from "@/components/login/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white">
      {/* Left Section */}
      <div className="relative flex items-center justify-center bg-[#f7f7f7]">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <img src="/images/logo.png" alt="Logo" className="h-12 w-auto" />
        </div>

        <ForgotPasswordForm />
      </div>

      {/* Right Section */}
      <div className="hidden lg:flex bg-[#1565c0] items-center justify-center relative overflow-hidden">
        <img
          src="/images/login_page_img.png"
          alt="Login Illustration"
          className="w-[75%] object-contain"
        />
      </div>
    </div>
  );
}
