import StorageEditWrapper from "@/components/storage/StorageEditWrapper";

export const metadata = {
  title: "Edit Storage",
};

export default async function EditStoragePage({ params }) {
  const { id } = await params;
  return <StorageEditWrapper id={id} />;
}
