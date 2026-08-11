"use client";

import { useEffect, useState } from "react";
import ItemUomForm from "@/components/item-uom/ItemUomForm";
import { getItemUom } from "@/lib/api/item-uom-api";
import { Loader2 } from "lucide-react";

export default function ItemUomEditWrapper({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getItemUom({ id });
        const isSuccess = response?.success === 1 || response?.settings?.success === 1;
        const responseData = response?.data || response?.settings?.data;
        const message = response?.message || response?.settings?.message;

        if (isSuccess && responseData) {
          setData(responseData);
        } else {
          setError(message || "Failed to load Item UOM data");
        }
      } catch (err) {
        setError("Failed to fetch Item UOM details");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return <ItemUomForm mode="edit" initialData={data} id={id} />;
}
