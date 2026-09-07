import { getProductionBatchDetails } from "@/lib/api/production-batch-api";
import ProductionBatchDetailPage from "@/components/production-batch/ProductionBatchDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionBatchDetails({ id });
    const code = res?.data?.batchCode || res?.settings?.data?.batchCode;
    if (code) {
      return { title: `${code} | Production Batch Details` };
    }
  } catch (error) {
  }
  return { title: "Production Batch Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionBatchDetails({ id });
    if (res?.accessDenied) {
      return <ProductionBatchDetailPage batchData={{ accessDenied: true, requiredPermission: res.requiredPermission }} />;
    }
    if (res?.success === 0 || res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data || (Array.isArray(data) && data.length === 0)) return notFound();
    return <ProductionBatchDetailPage batchData={data} />;
  } catch (error) {
    return notFound();
  }
}
