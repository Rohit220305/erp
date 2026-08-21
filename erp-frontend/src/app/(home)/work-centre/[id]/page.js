import { getWorkCentre } from "@/lib/api/work-centre-api";
import WorkCentreDetailPage from "@/components/work-centre/WorkCentreDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getWorkCentre({ id });
    const workCentreName = res?.data?.workCentreName || res?.settings?.data?.workCentreName;
    if (workCentreName) {
      return { title: `${workCentreName} | Work Centre` };
    }
  } catch (error) {
    //
  }
  return { title: "Work Centre Details" };
}

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
