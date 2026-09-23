import ProcessTemplateEditWrapper from "@/components/process-template/ProcessTemplateEditWrapper";

export default async function EditProcessTemplatePage({ params }) {
  const { id } = await params;
  return <ProcessTemplateEditWrapper id={id} />;
}
