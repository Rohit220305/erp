import { Suspense } from "react";
import { getProductionBatchDetails } from "@/lib/api/production-batch-api";
import ProductionBatchDetailPage from "@/components/production-batch/ProductionBatchDetailPage";
import Loader from "@/components/common/Loader";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionBatchDetails({ id });
    if (res?.accessDenied) {
      return (
        <Suspense fallback={<Loader fullPage />}>
          <ProductionBatchDetailPage batchData={{ accessDenied: true, requiredPermission: res.requiredPermission }} />
        </Suspense>
      );
    }
    if (res?.success === 0 || res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data || (Array.isArray(data) && data.length === 0)) return notFound();
    return (
      <Suspense fallback={<Loader fullPage />}>
        <ProductionBatchDetailPage batchData={data} />
      </Suspense>
    );
  } catch (error) {
    return notFound();
  }
}
