import { getStorage } from "@/lib/api/storage-api";
import StorageDetailPage from "@/components/storage/StorageDetailPage";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getStorage({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <StorageDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
