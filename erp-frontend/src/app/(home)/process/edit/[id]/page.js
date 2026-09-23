import ProcessEditWrapper from "@/components/process/ProcessEditWrapper";

export default async function EditProcessPage({ params }) {
  const { id } = await params;
  return <ProcessEditWrapper id={id} />;
}
