import ItemCategoryEditWrapper from "@/components/item-category/ItemCategoryEditWrapper";

export default async function ItemCategoryEditPage({ params }) {
  params = await params;
  return <ItemCategoryEditWrapper id={params.id} />;
}
