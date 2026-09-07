"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { getBrand } from "@/lib/api/brand-api";
import toast from "react-hot-toast";
import BrandForm from "./BrandForm";
import Loader from "@/components/common/Loader";

export default function BrandEditWrapper({ id }) {
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getBrand({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load brand details");
          router.push(buildRoute("brand", "list"));
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading brand details");
        router.push(buildRoute("brand", "list"));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <BrandForm mode="edit" initialData={initialData} id={id} />;
}
