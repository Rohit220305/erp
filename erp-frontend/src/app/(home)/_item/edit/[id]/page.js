import ItemEditWrapper from "@/components/item/ItemEditWrapper";

export default async function EditItemPage({ params }) {
  const { id } = await params;
  return <ItemEditWrapper mode="edit" id={id} />;
}
