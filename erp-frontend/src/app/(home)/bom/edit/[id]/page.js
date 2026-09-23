import BomEditWrapper from "@/components/bom/BomEditWrapper";

export default async function EditBomPage({ params }) {
  const { id } = await params;
  return <BomEditWrapper id={id} />;
}
