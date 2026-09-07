"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBom } from "@/lib/api/bom-api";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import toast from "react-hot-toast";
import BomForm from "./BomForm";
import Loader from "@/components/common/Loader";

export default function BomEditWrapper({ id }) {
  const router = useRouter();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await getBom({ id: Number(id) });
        if (!isMounted) return;

        if (res && (res.success === 1 || res.settings?.success === 1)) {
          const data = res.data || res.settings?.data || {};
          if (data.processStages && Array.isArray(data.processStages)) {
            const flatItems = [];
            data.processStages.forEach((stage) => {
              (stage.entryItems || []).forEach((item) => {
                flatItems.push({
                  ...item,
                  processTemplateMappingId: stage.processTemplateMappingId,
                  materialType: "Entry",
                });
              });
              (stage.exitItems || []).forEach((item) => {
                flatItems.push({
                  ...item,
                  processTemplateMappingId: stage.processTemplateMappingId,
                  materialType: "Exit",
                });
              });
            });
            data.items = flatItems;
          }
          setInitialData(data);
        } else {
          toast.error("Failed to load BOM details");
          router.push(buildRoute("bom", "list"));
        }
      } catch (error) {
        if (!isMounted) return;
        toast.error("Error loading BOM details");
        router.push(buildRoute("bom", "list"));
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

  return <BomForm mode="edit" initialData={initialData} id={id} />;
}
