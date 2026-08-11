import ManufacturerDetailPage from "@/components/manufacturer/ManufacturerDetailPage";
import { getManufacturer } from "@/lib/api/manufacturer-api";

export default async function ManufacturerDetailsRoute({ params }) {
  params = await params;
  const { id } = params;
  const res = await getManufacturer({ id });

  let data = null;
  if (res && (res.success === 1 || res.settings?.success === 1)) {
    data = res.data || res.settings?.data || {};
  } else {
    data = { accessDenied: true, ...res };
  }

  return <ManufacturerDetailPage data={data} />;
}
