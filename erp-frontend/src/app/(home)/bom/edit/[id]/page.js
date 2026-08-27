import BomEditWrapper from "@/components/bom/BomEditWrapper";

export const metadata = {
  title: "Edit BOM | ERP System",
  description: "Edit existing Bill of Materials in the ERP system",
};

export default async function EditBomPage({ params }) {
  const { id } = await params;
  return <BomEditWrapper id={id} />;
}
