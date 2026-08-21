import ItemCategoryDetailPage from "@/components/item-category/ItemCategoryDetailPage";
import { getItemCategory } from "@/lib/api/item-category-api";

export default async function ItemCategoryMasterDetailPage({ params }) {
  params = await params;
  const { id } = params;
  const res = await getItemCategory({ id });

  let data = null;
  if (res && (res.success === 1 || res.settings?.success === 1)) {
    data = res.data || res.settings?.data || {};
  } else {
    data = { accessDenied: true, ...res };
  }

  return <ItemCategoryDetailPage data={data} />;
}
