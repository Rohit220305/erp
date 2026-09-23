import { Suspense } from "react";
import { getBom } from "@/lib/api/bom-api";
import BomDetailPage from "@/components/bom/BomDetailPage";
import Loader from "@/components/common/Loader";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getBom({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return (
      <Suspense fallback={<Loader fullPage />}>
        <BomDetailPage data={data} />
      </Suspense>
    );
  } catch (error) {
    return notFound();
  }
}
