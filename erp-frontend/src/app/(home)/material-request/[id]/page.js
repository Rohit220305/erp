import { getMaterialRequest } from "@/lib/api/material-request-api";
import MaterialRequestDetailPage from "@/components/material-request/MaterialRequestDetailPage";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getMaterialRequest({ id });
    if (res?.success === 0 || res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.settings?.data || res?.data;
    if (!data) return notFound();
    return <MaterialRequestDetailPage id={id} initialData={data} />;
  } catch (error) {
    return notFound();
  }
}
