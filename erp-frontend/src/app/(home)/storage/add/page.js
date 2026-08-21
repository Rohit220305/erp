import StorageForm from "@/components/storage/StorageForm";

export const metadata = {
  title: "Add Storage",
};

export default function AddStoragePage() {
  return <StorageForm mode="create" />;
}
