"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getProductionOrder } from "@/lib/api/production-order-api";
import ProductionOrderForm from "./ProductionOrderForm";
import Loader from "@/components/common/Loader";

export default function ProductionOrderEditWrapper() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await getProductionOrder({ id });
        const data = res?.settings?.data || res?.data;
        if (data) {
          setOrderData(data);
        } else {
          toast.error("Production Order not found");
          router.push("/production-order");
        }
      } catch (err) {
        console.error("Failed to load production order for edit:", err);
        toast.error("Failed to load Production Order");
        router.push("/production-order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return <Loader overlay />;
  }

  if (!orderData) return null;

  return <ProductionOrderForm mode="edit" initialData={orderData} id={id} />;
}
