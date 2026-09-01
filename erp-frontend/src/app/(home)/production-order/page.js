export const metadata = {
  title: "Production Orders | ERP System",
  description: "Production Order management in the ERP system",
};

import ProductionOrderListing from "@/components/production-order/ProductionOrderListing";

export default function ProductionOrderPage() {
  return <ProductionOrderListing />;
}
