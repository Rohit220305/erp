import ItemEditWrapper from "@/components/item/ItemEditWrapper";

export const metadata = {
  title: "Edit Item",
};

export default async function EditItemPage({ params }) {
  const { id } = await params;
  return <ItemEditWrapper mode="edit" id={id} />;
}
