"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStorage } from "@/lib/api/storage-api";
import toast from "react-hot-toast";
import StorageForm from "./StorageForm";
import Loader from "@/components/common/Loader";

export default function StorageEditWrapper({ id }) {
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getStorage({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load storage details");
          router.push("/storage");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading storage details");
        router.push("/storage");
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

  return <StorageForm mode="edit" initialData={initialData} id={id} />;
}
