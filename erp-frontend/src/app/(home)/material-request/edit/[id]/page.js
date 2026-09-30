import MaterialRequestForm from "@/components/material-request/MaterialRequestForm";

export default async function EditMaterialRequestPage({ params }) {
  const { id } = await params;
  return <MaterialRequestForm id={id} />;
}
