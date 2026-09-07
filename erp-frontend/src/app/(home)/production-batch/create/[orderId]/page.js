export const metadata = {
  title: "Create Production Batch | ERP System",
  description: "Create a new Production Batch from Production Order",
};

import ProductionBatchForm from "@/components/production-batch/ProductionBatchForm";

export default async function CreateProductionBatchPage({ params }) {
  const { orderId } = await params;

  if (!orderId) {
    return <div className="p-8 text-center text-gray-500">No Production Order ID provided.</div>;
  }

  return (
    <div className="h-full bg-gray-50/50">
      <ProductionBatchForm orderId={orderId} />
    </div>
  );
}
