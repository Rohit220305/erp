import PackageDetailPage from "@/components/package-master/PackageDetailPage";
import { getPackage } from "@/lib/api/package-master-api";

export default async function PackageMasterDetailPage({ params }) {
  params = await params;
  const { id } = params;
  const res = await getPackage({ id });

  let data = null;
  if (res && (res.success === 1 || res.settings?.success === 1)) {
    data = res.data || res.settings?.data || {};
  } else {
    data = { accessDenied: true, ...res };
  }

  return <PackageDetailPage data={data} />;
}
