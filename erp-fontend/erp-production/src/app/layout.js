import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { HeaderProvider } from "@/context/HeaderContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <HeaderProvider>{children}</HeaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
