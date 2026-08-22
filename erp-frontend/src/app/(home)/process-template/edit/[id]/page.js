export const metadata = {
  title: "Edit Process Template | ERP System",
  description: "Edit process template in the ERP system",
};

import ProcessTemplateEditWrapper from "@/components/process-template/ProcessTemplateEditWrapper";

export default async function EditProcessTemplatePage({ params }) {
  const { id } = await params;
  return <ProcessTemplateEditWrapper id={id} />;
}
