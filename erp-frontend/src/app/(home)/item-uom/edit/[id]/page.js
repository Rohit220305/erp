import ItemUomEditWrapper from "../../../../../components/item-uom/ItemUomEditWrapper";

export default async function EditItemUomPage({ params }) {
  const { id } = await params;
  return <ItemUomEditWrapper id={id} />;
}
