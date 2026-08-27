export const metadata = {
  title: "Add New BOM | ERP System",
  description: "Create a new Bill of Materials in the ERP system",
};

import BomForm from "@/components/bom/BomForm";

export default function AddBomPage() {
  return <BomForm mode="create" />;
}
