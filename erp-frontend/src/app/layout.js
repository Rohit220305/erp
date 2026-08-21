import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";

export const metadata = {
  title: {
    default: "Production Planning ERP",
    template: "%s | Production Planning ERP",
  },
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
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 2000,
                style: {
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                },
                success: {
                  iconTheme: { primary: "#1565c0", secondary: "#fff" },
                },
              }}
            />
          </HeaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
