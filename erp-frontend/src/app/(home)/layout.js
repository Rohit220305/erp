import AppLayout from "@/components/layout/AppLayout";
import { ListingProvider } from "@/context/ListingContext";
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUserWithCapabilities } from "@/lib/api/auth/current-user";

import { redirect } from "next/navigation";

export default async function HomeLayout({ children }) {
  const { user, capabilities, isImpersonating } = await getCurrentUserWithCapabilities();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider initialUser={user} initialCapabilities={capabilities} initialIsImpersonating={isImpersonating}>
      <ListingProvider>
        <AppLayout>{children}</AppLayout>
      </ListingProvider>
    </AuthProvider>
  );
}

