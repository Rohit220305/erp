import AppLayout from "@/components/layout/AppLayout";
import { ListingProvider } from "@/context/ListingContext";
import { AuthProvider } from "@/context/AuthContext";
import { getCurrentUserWithCapabilities } from "@/lib/api/auth/current-user";

export default async function HomeLayout({ children }) {
  const { user, capabilities } = await getCurrentUserWithCapabilities();

  return (
    <AuthProvider initialUser={user} initialCapabilities={capabilities}>
      <ListingProvider>
        <AppLayout>{children}</AppLayout>
      </ListingProvider>
    </AuthProvider>
  );
}

