"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { suggestBatch, addProductionBatch } from "@/lib/api/production-batch-api";
import { getProductionBatchSchema } from "@/lib/validation/production-batch.schema";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import ProductionBatchProcessTabs from "./ProductionBatchProcessTabs";
import Loader from "@/components/common/Loader";

export default function ProductionBatchForm({ orderId }) {
  const router = useRouter();
  const { user } = useAuth();
  const { setConfig, resetConfig } = useHeader();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [batchData, setBatchData] = useState(null);
  const [activeTab, setActiveTab] = useState("SUMMARY");

  const [calculatedProcesses, setCalculatedProcesses] = useState([]);
  const [allExitItemIds, setAllExitItemIds] = useState(new Set());

  const primitiveQty = batchData?.primitiveQuantity || 1;
  const schema = getProductionBatchSchema(primitiveQty);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyId: null,
      productionOrderId: Number(orderId),
      bomId: 0,
      batchQuantity: 1,
      batchCode: "",
      processes: [],
    },
  });

  const watchBatchQty = watch("batchQuantity", primitiveQty);

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: ["refresh"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: "Add",
        breadcrumbs: [
          { label: "Master", href: buildRoute("home", "list") },
          { label: "Production Batches", href: buildRoute("production-batch", "list") },
        ],
        actionButton: null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, orderId]);

  useEffect(() => {
    const fetchSuggest = async () => {
      try {
        const res = await suggestBatch(orderId);
        const data = res?.settings?.data || res?.data;
        if (data) {
          setBatchData(data);
          setValue("companyId", data.companyId || null);
          setValue("productionOrderId", Number(orderId));
          setValue("bomId", data.bomId || 0);
          setValue("batchQuantity", data.primitiveQuantity || 1);
        } else {
          toast.error("Failed to load batch suggestions.");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to load batch suggestions.");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchSuggest();
  }, [orderId, setValue]);

  useEffect(() => {
    if (!batchData?.processes) {
      setCalculatedProcesses([]);
      setAllExitItemIds(new Set());
      return;
    }

    const currentQty = Number(watchBatchQty) || primitiveQty;
    const factor = currentQty / primitiveQty;

    const newProcesses = batchData.processes.map((proc) => {
      const updatedItems = (proc.items || []).map((item) => ({
        ...item,
        requestQty: parseFloat((item.baseQty * factor).toFixed(2)),
        shortage: Math.max(0, parseFloat((item.baseQty * factor).toFixed(2))),
        totalRequirement: parseFloat((item.baseQty * factor).toFixed(2)),
      }));
      return { ...proc, items: updatedItems };
    });

    const ids = new Set();
    newProcesses.forEach((proc) => {
      (proc.items || []).forEach((item) => {
        if (item.materialType === "Exit") {
          ids.add(item.itemId);
        }
      });
    });

    setCalculatedProcesses(newProcesses);
    setAllExitItemIds(ids);
  }, [batchData, watchBatchQty, primitiveQty]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        companyId: batchData?.companyId || formData.companyId,
        productionOrderId: Number(orderId),
        bomId: batchData?.bomId || formData.bomId,
        itemId: batchData?.itemId,
        batchQuantity: Number(formData.batchQuantity),
        batchCode: formData.batchCode || undefined,
        processes: calculatedProcesses.map((proc) => ({
          processTemplateMappingId: proc.processTemplateMappingId,
          processId: proc.processId,
          sequenceNumber: proc.sequenceNumber,
          items: proc.items.map((item) => ({
            itemId: item.itemId,
            materialType: item.materialType,
            requiredQty: item.baseQty,
            requestQty: item.requestQty,
            shortage: item.shortage,
          })),
        })),
      };

      const res = await addProductionBatch(payload);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;

      if (isSuccess) {
        toast.success(
          res?.settings?.message || res?.message || "Batch created successfully!"
        );
        router.push(buildRoute("production-batch", "list"));
      } else {
        const errorMsg = Array.isArray(res?.message)
          ? res.message.join(", ")
          : res?.settings?.message || res?.message || "Failed to create batch.";
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to create batch.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewSuggestedQty = () => {
    if (batchData?.pendingQuantity) {
      setValue("batchQuantity", batchData.pendingQuantity);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!batchData) {
    return (
      <div className="p-8 text-center text-gray-500">
        Could not load Batch data.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="h-full overflow-y-scroll pb-10 bg-gray-50">
      <div className="h-full px-8 pt-4 space-y-6">
        
        <div>
          <h1 className="text-xl font-bold text-gray-800">Add</h1>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
          
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-800 tracking-wide">
              {batchData.productionOrderCode || "MPR/----/--/----"}
            </h2>
            {/* <div className="flex items-center gap-4">
              <span className="text-gray-700 font-bold text-sm">
                Batch No #1
              </span>
              <button
                type="button"
                onClick={handleViewSuggestedQty}
                className="bg-[#1565c0] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition cursor-pointer"
              >
                View Suggested Qty
              </button>
            </div> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
            
            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Item Name
                </span>
                <span className="block font-medium text-[#1565c0] text-sm">
                  {batchData.itemName || "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Customer
                </span>
                <span className="block font-medium text-[#1565c0] text-sm">
                  {batchData.customerName || "Casa Comfort Enterprise Lmt"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Pending Qty
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {batchData.pendingQuantityDisplay || "350.50 gms"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  BoM Name
                </span>
                <span className="block font-medium text-[#1565c0] text-sm">
                  {batchData.bomName || "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Production Date
                </span>
                <span className="block font-medium text-gray-800 text-sm">
                  {batchData.productionDateFormatted || "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Primitive Qty
                </span>
                <span className="block font-medium text-gray-800 text-sm">
                  {parseFloat(batchData.primitiveQuantity).toFixed(2) || "1.00"}{" "}
                  {batchData.uomName || "gms"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Process Template Name
                </span>
                <span className="block font-medium text-[#1565c0] text-sm">
                  {batchData.processTemplateName || "Gold Manufacturing"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Requested By
                </span>
                <span className="block font-medium text-[#1565c0] text-sm">
                  {batchData.addedByName || "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1 font-semibold text-gray-700">
                  Batch Qty
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex border border-gray-300 rounded overflow-hidden w-36 bg-white">
                    <input
                      type="number"
                      step="0.01"
                      {...register("batchQuantity")}
                      className="w-full px-2 py-1 text-sm outline-none text-gray-800"
                    />
                    <span className="bg-gray-100 border-l border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-center">
                      {batchData.uomName || "gms"}
                    </span>
                  </div>
                  <Info size={16} className="text-gray-400 cursor-pointer" />
                </div>
                {errors.batchQuantity && (
                  <span className="text-xs text-red-500 font-medium mt-1 block">
                    {errors.batchQuantity.message}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Plant Name
                </span>
                <span className="block font-medium text-[#1565c0] text-sm">
                  {batchData.plantName || batchData.companyName || "Atlas Tar Plant"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1">
                  Total Qty
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {batchData.totalQuantityDisplay || batchData.productionQuantityDisplay || "350.50 gms"}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-[11px] mb-1 font-semibold text-gray-700">
                  Batch No*
                </span>
                <input
                  type="text"
                  {...register("batchCode")}
                  className="w-full border border-gray-300 rounded px-2.5 py-1 text-sm outline-none focus:border-blue-500"
                  placeholder=""
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-800">Process Details</h2>
        </div>

        <ProductionBatchProcessTabs
          calculatedProcesses={calculatedProcesses}
          allExitItemIds={allExitItemIds}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex justify-center pt-4 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="border border-[#1565c0] text-[#1565c0] bg-white px-8 py-2 rounded-md font-medium text-sm hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Creating..." : "Create Batch"}
          </button>
        </div>
      </div>
    </form>
  );
}
