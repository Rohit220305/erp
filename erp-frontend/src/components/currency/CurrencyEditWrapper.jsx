"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrency } from "@/lib/api/currency-api";
import toast from "react-hot-toast";
import CurrencyForm from "./CurrencyForm";

export default function CurrencyEditWrapper({ id }) {
  console.log("CurrencyEditWrapper id:", id);
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getCurrency({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load currency details");
          router.push("/currency");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading currency details");
        router.push("/currency");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <CurrencyForm mode="edit" initialData={initialData} id={id} />;
}
