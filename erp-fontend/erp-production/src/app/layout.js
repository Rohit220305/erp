import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";

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
                duration: 4000,
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
