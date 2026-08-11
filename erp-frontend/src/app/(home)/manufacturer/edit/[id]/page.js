import ManufacturerEditWrapper from "@/components/manufacturer/ManufacturerEditWrapper";

export default async function ManufacturerEditPage({ params }) {
  params = await params;
  return <ManufacturerEditWrapper id={params.id} />;
}
