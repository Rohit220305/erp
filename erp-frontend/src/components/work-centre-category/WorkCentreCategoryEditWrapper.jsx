"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorkCentreCategory } from "@/lib/api/work-centre-category-api";
import toast from "react-hot-toast";
import WorkCentreCategoryForm from "./WorkCentreCategoryForm";
import Loader from "@/components/common/Loader";

export default function WorkCentreCategoryEditWrapper({ id }) {
  const router = useRouter();
  
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getWorkCentreCategory({ id: Number(id) });
        if (!isMounted) return;
        
        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load category details");
          router.push("/work-centre-category");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading category details");
        router.push("/work-centre-category");
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

  return <WorkCentreCategoryForm mode="edit" initialData={initialData} id={id} />;
}
