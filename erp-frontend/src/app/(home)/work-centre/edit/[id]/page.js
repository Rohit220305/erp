import WorkCentreEditWrapper from "@/components/work-centre/WorkCentreEditWrapper";

export default async function EditWorkCentrePage({ params }) {
  const { id } = await params;
  return <WorkCentreEditWrapper id={id} />;
}
