import BrandEditWrapper from "@/components/brand/BrandEditWrapper";

export const metadata = {
  title: "Edit Brand",
};

export default async function EditBrandPage({ params }) {
  const { id } = await params;
  return <BrandEditWrapper id={id} />;
}
