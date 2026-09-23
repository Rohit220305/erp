import StorageEditWrapper from "@/components/storage/StorageEditWrapper";

export default async function EditStoragePage({ params }) {
  const { id } = await params;
  return <StorageEditWrapper id={id} />;
}
