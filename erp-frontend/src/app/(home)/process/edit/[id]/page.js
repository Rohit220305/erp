export const metadata = {
  title: "Edit Process | ERP System",
  description: "Edit process in the ERP system",
};

import ProcessEditWrapper from "@/components/process/ProcessEditWrapper";

export default async function EditProcessPage({ params }) {
  const { id } = await params;
  return <ProcessEditWrapper id={id} />;
}
