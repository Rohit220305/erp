export const metadata = {
  title: "Add Process Template | ERP System",
  description: "Add a new process template in the ERP system",
};

import ProcessTemplateForm from "@/components/process-template/ProcessTemplateForm";

export default function AddProcessTemplatePage() {
  return <ProcessTemplateForm mode="create" />;
}
