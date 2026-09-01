import { getProductionOrder } from "@/lib/api/production-order-api";
import ProductionOrderDetailPage from "@/components/production-order/ProductionOrderDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionOrder({ id });
    const code = res?.data?.productionOrderCode || res?.settings?.data?.productionOrderCode;
    if (code) {
      return { title: `${code} | Production Order Details` };
    }
  } catch (error) {
    //
  }
  return { title: "Production Order Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionOrder({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <ProductionOrderDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
