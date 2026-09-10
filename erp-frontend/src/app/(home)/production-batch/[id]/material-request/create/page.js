import { getProductionBatchDetails } from "@/lib/api/production-batch-api";
import { suggestMaterialRequest } from "@/lib/api/material-request-api";
import ProductionMaterialRequestForm from "@/components/production-batch/details/ProductionMaterialRequestForm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getProductionBatchDetails({ id });
    const code = res?.data?.batchCode || res?.settings?.data?.batchCode;
    if (code) {
      return { title: `Request Material - ${code}` };
    }
  } catch (error) { }
  return { title: "Request Material" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const batchRes = await getProductionBatchDetails({ id });
    if (batchRes?.accessDenied) {
      return <ProductionMaterialRequestForm batchData={{ accessDenied: true, requiredPermission: batchRes.requiredPermission }} />;
    }
    if (batchRes?.success === 0 || batchRes?.settings?.success === 0) {
      return notFound();
    }

    const batchData = batchRes?.data || batchRes?.settings?.data;
    if (!batchData || (Array.isArray(batchData) && batchData.length === 0)) return notFound();

    const suggestRes = await suggestMaterialRequest({ productionBatchId: id });
    const initialSuggestions = suggestRes?.data || suggestRes?.settings?.data || [];

    return <ProductionMaterialRequestForm batchData={batchData} initialSuggestions={initialSuggestions} />;
  } catch (error) {
    return notFound();
  }
}
