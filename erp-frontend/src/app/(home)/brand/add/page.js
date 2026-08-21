import BrandForm from "@/components/brand/BrandForm";

export const metadata = {
  title: "Add Brand",
};

export default function AddBrandPage() {
  return <BrandForm mode="create" />;
}
