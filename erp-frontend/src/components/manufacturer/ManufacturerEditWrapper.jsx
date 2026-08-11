"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getManufacturer } from "@/lib/api/manufacturer-api";
import toast from "react-hot-toast";
import ManufacturerForm from "./ManufacturerForm";
import Loader from "@/components/common/Loader";

export default function ManufacturerEditWrapper({ id }) {
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getManufacturer({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load manufacturer details");
          router.push("/manufacturer");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading manufacturer details");
        router.push("/manufacturer");
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

  return <ManufacturerForm mode="edit" initialData={initialData} id={id} />;
}
