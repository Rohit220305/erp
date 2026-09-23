import { Suspense } from "react";
import { getProductionOrder } from "@/lib/api/production-order-api";
import ProductionOrderDetailPage from "@/components/production-order/ProductionOrderDetailPage";
import Loader from "@/components/common/Loader";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionOrder({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return (
      <Suspense fallback={<Loader fullPage />}>
        <ProductionOrderDetailPage data={data} />
      </Suspense>
    );
  } catch (error) {
    return notFound();
  }
}
