"use client";

import { useEffect, useState } from "react";
import { getWorkCentre } from "@/lib/api/work-centre-api";
import WorkCentreForm from "./WorkCentreForm";
import Loader from "../common/Loader";

export default function WorkCentreEditWrapper({ id }) {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkCentre = async () => {
      try {
        const response = await getWorkCentre({ id });
        const data = response?.settings?.data || response?.data;
        if (data) {
          setInitialData({
            workCentreName: data.workCentreName || "",
            workCentreCode: data.workCentreCode || "",
            companyId: data.companyId || "",
            categoryId: data.categoryId || "",
            usageStatus: data.usageStatus || "Available",
            status: data.status || "Active",
            imageUrl: data.imageUrl || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch work centre data", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorkCentre();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Work centre not found or you don&apos;t have access.</p>
      </div>
    );
  }

  return <WorkCentreForm mode="edit" initialData={initialData} id={id} />;
}
