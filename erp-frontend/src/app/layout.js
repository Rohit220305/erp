import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";
import ToastProvider from "@/components/common/ToastProvider";

export const metadata = {
  title: "Production Management",
  icons: {
    icon: "/images/production-logo.png",
  },
  description: "Production Planning ERP System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <HeaderProvider>
            {children}
            <ToastProvider />
          </HeaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
