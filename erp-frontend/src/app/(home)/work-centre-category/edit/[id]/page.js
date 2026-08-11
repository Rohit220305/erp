import WorkCentreCategoryEditWrapper from "@/components/work-centre-category/WorkCentreCategoryEditWrapper";

export default async function WorkCentreCategoryEditPage({ params }) {
  params = await params;
  return <WorkCentreCategoryEditWrapper id={params.id} />;
}
