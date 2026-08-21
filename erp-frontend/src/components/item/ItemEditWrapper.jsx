"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItem } from "@/lib/api/item-api";
import ItemForm from "./ItemForm";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader";

export default function ItemEditWrapper({ mode = "create", id = null }) {
  const router = useRouter();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(mode === "edit");

  useEffect(() => {
    if (mode === "edit" && id) {
      let isMounted = true;
      const loadItem = async () => {
        try {
          const res = await getItem({ id: Number(id) });
          if (!isMounted) return;
          const itemData = res?.settings?.data || res?.data;

          if (itemData) {
            setInitialData(itemData);
          } else {
            toast.error("Item not found");
            router.push("/item");
          }
        } catch (error) {
          if (!isMounted) return;
          console.error("Failed to fetch item", error);
          toast.error("Failed to load item details");
          router.push("/item");
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadItem();
      return () => { isMounted = false; };
    }
  }, [id, mode, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return <ItemForm mode={mode} initialData={initialData} id={id} />;
}
