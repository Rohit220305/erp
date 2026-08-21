import { getBrand } from "@/lib/api/brand-api";
import BrandDetailPage from "@/components/brand/BrandDetailPage";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await getBrand({ id });
    const brandName = res?.data?.brandName || res?.settings?.data?.brandName;
    if (brandName) {
      return { title: `${brandName} | Brand` };
    }
  } catch (error) {
    //
  }
  return { title: "Brand Details" };
}

export default async function Page({ params }) {
  const { id } = await params;
  try {
    const res = await getBrand({ id });
    if (res?.success === 0 && res?.settings?.success === 0) {
      return notFound();
    }
    const data = res?.data || res?.settings?.data;
    if (!data) return notFound();
    return <BrandDetailPage data={data} />;
  } catch (error) {
    return notFound();
  }
}
