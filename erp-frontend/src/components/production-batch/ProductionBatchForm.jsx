"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
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
import ModuleLink from "@/components/common/ModuleLink";
import SideDrawer from "@/components/common/SideDrawer";
import { formatNumber } from "@/utils/number-formatter";
import { displayFormat } from "@/utils/no-data-formatter";
import NumericInput from "@/components/common/NumericInput";

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
  const [sideDrawerState, setSideDrawerState] = useState({ isOpen: false, moduleName: null, id: null });

  const handleOpenDrawer = (moduleName, id) => {
    if (moduleName && id) {
      setSideDrawerState({ isOpen: true, moduleName, id });
    }
  };
  const primitiveQty = batchData?.primitiveQuantity || 1;
  const pendingQuantity = batchData?.pendingQuantity || null;
  const schema = getProductionBatchSchema(primitiveQty, pendingQuantity);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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
          {label: "Production", },
          { label: "Create Batch", href: buildRoute("production-order", "detail", { id: orderId }) },
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
        shortage: Math.max(0, parseFloat((item.baseQty * factor).toFixed(4))),
        totalRequirement: parseFloat((item.baseQty * factor).toFixed(4)),
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
            requiredQty: item.totalRequirement,
            requestedQty: 0,
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
        router.push(buildRoute("production-order", "detail", { id: orderId }));
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

  const prodOrderId = orderId || batchData.productionOrderId;
  const customerId = batchData.customerCompanyId || batchData.customerId;
  const plantId = batchData.companyId || batchData.plantId;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full overflow-y-scroll pb-10 bg-gray-50"
    >
      <div className="h-full px-8 pt-4 space-y-6">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            {prodOrderId ? (
              <ModuleLink
                moduleName="ProductionOrder"
                id={prodOrderId}
                className="text-base font-bold text-[#1565c0] tracking-wide hover:underline"
                onOpenDrawer={handleOpenDrawer}
              >
                {batchData.productionOrderCode}
              </ModuleLink>
            ) : (
              <h2 className="text-base font-bold text-gray-800 tracking-wide">
                {batchData.productionOrderCode}
              </h2>
            )}

            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-bold text-sm">
                Batch No #{batchData?.batchSeqNo || 1}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Item Name
                </span>
                {batchData.itemId ? (
                  <ModuleLink
                    moduleName="Item"
                    id={batchData.itemId}
                    className="block font-medium text-[#1565c0] text-sm hover:underline"
                    onOpenDrawer={handleOpenDrawer}
                  >
                    {displayFormat(batchData.itemName)}
                  </ModuleLink>
                ) : (
                  <span className="block font-medium text-gray-800 text-sm">
                    {displayFormat(batchData.itemName)}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  BOM
                </span>
                {batchData.bomId ? (
                  <ModuleLink
                    moduleName="Bom"
                    id={batchData.bomId}
                    className="block font-medium text-[#1565c0] text-sm hover:underline"
                    onOpenDrawer={handleOpenDrawer}
                  >
                    {displayFormat(batchData.bomName)}
                  </ModuleLink>
                ) : (
                  <span className="block font-medium text-gray-800 text-sm">
                    {displayFormat(batchData.bomName)}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Process Template
                </span>
                {batchData.processTemplateId ? (
                  <ModuleLink
                    moduleName="ProcessTemplate"
                    id={batchData.processTemplateId}
                    className="block font-medium text-[#1565c0] text-sm hover:underline"
                    onOpenDrawer={handleOpenDrawer}
                  >
                    {batchData.processTemplateName }
                  </ModuleLink>
                ) : (
                  <span className="block font-medium text-gray-800 text-sm">
                    {batchData.processTemplateName}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Requested By
                </span>
                {batchData.addedBy ? (
                  <ModuleLink
                    moduleName="User"
                    id={batchData.addedBy}
                    className="block font-medium text-[#1565c0] text-sm hover:underline"
                    onOpenDrawer={handleOpenDrawer}
                  >
                    {displayFormat(batchData.addedByName)}
                  </ModuleLink>
                ) : (
                  <span className="block font-medium text-gray-800 text-sm">
                    {displayFormat(batchData.addedByName)}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Customer Name
                </span>
                <span className="block font-medium text-gray-800 text-sm">
                  {displayFormat(batchData.customerName)}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Pending Qty
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {batchData.pendingQuantityDisplay }
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Production Date
                </span>
                <span className="block font-medium text-gray-800 text-sm">
                  {displayFormat(batchData.productionDateFormatted, "DATE")}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Primitive Qty
                </span>
                <span className="block font-medium text-gray-800 text-sm">
                  {formatNumber(batchData.primitiveQuantity)}{" "}
                  {batchData.uomName || ""}
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1">
                  Total Qty
                </span>
                <span className="block font-bold text-gray-900 text-sm">
                  {batchData.totalQuantityDisplay ||
                    batchData.productionQuantityDisplay }
                </span>
              </div>

              <div>
                <span className="block text-gray-500 text-sm mb-1 font-semibold text-gray-700">
                  Batch Qty
                </span>
                <div className="flex items-center gap-2">
                    <div className="flex border border-gray-300 rounded overflow-hidden w-36 bg-white">
                      <Controller
                        name="batchQuantity"
                        control={control}
                        render={({ field }) => (
                          <NumericInput
                            maxDecimals={4}
                            min={0}
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            onBlur={field.onBlur}
                            className="w-full px-2 py-1 text-sm outline-none text-gray-800"
                          />
                        )}
                      />
                    <span className="bg-gray-100 border-l border-gray-200 px-2 py-1 text-xs text-gray-500 flex items-center">
                      {batchData.uomName || ""}
                    </span>
                  </div>
                </div>
                {errors.batchQuantity && (
                  <span className="text-xs text-red-500 font-medium mt-1 block">
                    {errors.batchQuantity.message}
                  </span>
                )}
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
          onOpenDrawer={handleOpenDrawer}
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

      <SideDrawer
        open={sideDrawerState.isOpen}
        onClose={() =>
          setSideDrawerState({ isOpen: false, moduleName: null, id: null })
        }
        moduleName={sideDrawerState.moduleName}
        mode="details"
        data={sideDrawerState.id ? { id: sideDrawerState.id } : null}
      />
    </form>
  );
}

