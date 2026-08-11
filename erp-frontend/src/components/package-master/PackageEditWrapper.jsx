"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPackage } from "@/lib/api/package-master-api";
import toast from "react-hot-toast";
import PackageForm from "./PackageForm";
import Loader from "@/components/common/Loader";

export default function PackageEditWrapper({ id }) {
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getPackage({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load package type details");
          router.push("/package-master");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading package type details");
        router.push("/package-master");
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

  return <PackageForm mode="edit" initialData={initialData} id={id} />;
}
