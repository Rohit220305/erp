export const metadata = {
  title: "Add Process | ERP System",
  description: "Add a new process in the ERP system",
};

import ProcessForm from "@/components/process/ProcessForm";

export default function AddProcessPage() {
  return <ProcessForm mode="create" />;
}
