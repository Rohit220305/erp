import WorkCentreEditWrapper from "@/components/work-centre/WorkCentreEditWrapper";

export const metadata = {
  title: "Edit Work Centre"
};

export default async function EditWorkCentrePage({ params }) {
  const { id } = await params;
  return <WorkCentreEditWrapper id={id} />;
}
