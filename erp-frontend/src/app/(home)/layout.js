import AppLayout from "@/components/layout/AppLayout";
import { ListingProvider } from "@/context/ListingContext";

export default function HomeLayout({ children }) {
  return (
    <ListingProvider>
      <AppLayout>{children}</AppLayout>
    </ListingProvider>
  );
}
