"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProcess } from "@/lib/api/process-api";
import toast from "react-hot-toast";
import ProcessForm from "./ProcessForm";
import Loader from "@/components/common/Loader";

export default function ProcessEditWrapper({ id }) {
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getProcess({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load process details");
          router.push("/process");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading process details");
        router.push("/process");
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

  return <ProcessForm mode="edit" initialData={initialData} id={id} />;
}
