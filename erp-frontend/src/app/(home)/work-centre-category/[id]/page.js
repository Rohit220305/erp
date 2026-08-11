import { notFound } from "next/navigation";
import WorkCentreCategoryDetailPage from "@/components/work-centre-category/WorkCentreCategoryDetailPage";
import { getWorkCentreCategory } from "@/lib/api/work-centre-category-api";

export default async function Page({ params }) {
  params = await params;
  const response = await getWorkCentreCategory({ id: params.id });
  if (!response || response.settings.success === 0 || !response.settings.data) {
     return notFound();
  }

  return <WorkCentreCategoryDetailPage category={response?.settings?.data} />;
}
