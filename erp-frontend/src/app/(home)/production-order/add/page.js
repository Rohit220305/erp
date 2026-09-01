export const metadata = {
  title: "Add New Production Order | ERP System",
  description: "Create a new Production Order in the ERP system",
};

import ProductionOrderForm from "@/components/production-order/ProductionOrderForm";

export default function AddProductionOrderPage() {
  return <ProductionOrderForm mode="create" />;
}
