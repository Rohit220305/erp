import { suggestMaterialRequest } from "@/lib/api/material-request-api";
import ProductionMaterialRequestForm from "@/components/production-batch/details/ProductionMaterialRequestForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await suggestMaterialRequest({ productionBatchId: id });
    const payload = res?.data || res?.settings?.data;
    const code = payload?.batchData?.batchCode;
    if (code) {
      return { title: `Request Material - ${code}` };
    }
  } catch (error) { }
  return { title: "Request Material" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const suggestRes = await suggestMaterialRequest({ productionBatchId: id });
    if (suggestRes?.accessDenied) {
      return <ProductionMaterialRequestForm batchData={{ accessDenied: true, requiredPermission: suggestRes.requiredPermission }} />;
    }
    if (suggestRes?.success === 0 || suggestRes?.settings?.success === 0) {
      return notFound();
    }

    const payload = suggestRes?.data || suggestRes?.settings?.data;
    if (!payload || !payload.batchData) return notFound();

    const { batchData, suggestions } = payload;

    return <ProductionMaterialRequestForm batchData={batchData} initialSuggestions={suggestions || []} />;
  } catch (error) {
    return notFound();
  }
}
