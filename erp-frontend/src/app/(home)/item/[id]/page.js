import ItemDetailPage from "@/components/item/ItemDetailPage";
import { getItem } from "@/lib/api/item-api";

export default async function ItemDetailRoute({ params }) {
  params = await params;
  const { id } = params;
  const res = await getItem({ id });

  let data = null;
  if (res && (res.success === 1 || res.settings?.success === 1)) {
    data = res.data || res.settings?.data || {};
  } else {
    data = { accessDenied: true, ...res };
  }

  return <ItemDetailPage data={data} />;
}
