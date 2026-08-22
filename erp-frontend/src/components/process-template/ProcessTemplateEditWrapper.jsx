"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProcessTemplate } from "@/lib/api/process-template-api";
import toast from "react-hot-toast";
import ProcessTemplateForm from "./ProcessTemplateForm";
import Loader from "@/components/common/Loader";

export default function ProcessTemplateEditWrapper({ id }) {
  const router = useRouter();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getProcessTemplate({ id: Number(id) });
        if (!isMounted) return;

        if (res && (res.success === 1 || res.settings?.success === 1)) {
          setInitialData(res.data || res.settings?.data || {});
        } else {
          toast.error("Failed to load process template details");
          router.push("/process-template");
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading process template details");
        router.push("/process-template");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader />
      </div>
    );
  }

  return <ProcessTemplateForm mode="edit" initialData={initialData} id={id} />;
}
