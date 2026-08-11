import ItemUomDetailPage from "@/components/item-uom/ItemUomDetailPage";
import { getItemUom } from "@/lib/api/item-uom-api";

export default async function ItemUomMasterDetailPage({ params }) {
  params = await params;
  const { id } = params;
  const res = await getItemUom({ id });

  let data = null;
  if (res && (res.success === 1 || res.settings?.success === 1)) {
    data = res.data || res.settings?.data || {};
  } else {
    data = { accessDenied: true, ...res };
  }

  return <ItemUomDetailPage data={data} />;
}
