import { getBom } from "@/lib/api/bom-api";
import BomDetailPage from "@/components/bom/BomDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getBom({ id });
    const bomName = res?.data?.bomName || res?.settings?.data?.bomName;
    if (bomName) {
      return { title: `${bomName} | BOM Details` };
    }
  } catch (error) {
    //
  }
  return { title: "BOM Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getBom({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <BomDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
