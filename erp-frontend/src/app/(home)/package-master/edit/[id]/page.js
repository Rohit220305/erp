import PackageEditWrapper from "@/components/package-master/PackageEditWrapper";

export default async function PackageEditPage({ params }) {
  params = await params;
  return <PackageEditWrapper id={params.id} />;
}
