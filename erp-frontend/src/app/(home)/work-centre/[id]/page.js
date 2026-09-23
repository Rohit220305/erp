import { getWorkCentre } from "@/lib/api/work-centre-api";
import WorkCentreDetailPage from "@/components/work-centre/WorkCentreDetailPage";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getWorkCentre({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <WorkCentreDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
