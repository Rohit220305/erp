"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { getProductionBatchDetails, markBatchCompleted, cancelProductionBatch } from "@/lib/api/production-batch-api";
import { toast } from "react-hot-toast";
import { useTabNavigation } from "@/hooks/useTabNavigation";
import Loader from "@/components/common/Loader";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import ConfirmModal from "@/components/common/ConfirmModal";
import ProductionBatchProcessDrawer from "./ProductionBatchProcessDrawer";
import ProductionBatchSidebar from "./details/ProductionBatchSidebar";
import ProductionBatchSummaryTab from "./details/ProductionBatchSummaryTab";
import ProductionBatchItemDetailsTab from "./details/ProductionBatchItemDetailsTab";
import ProductionBatchProcessItemDetailsTab from "./details/ProductionBatchProcessItemDetailsTab";
import ProductionBatchMaterialRequestTab from "./details/ProductionBatchMaterialRequestTab";
import ProductionBatchConsumptionLogTab from "./details/ProductionBatchConsumptionLogTab";
import ProductionBatchTimelineTab from "./details/ProductionBatchTimelineTab";
import ProductionBatchCostReportTab from "./details/ProductionBatchCostReportTab";

const VALID_TABS = [
  "summary",
  "item-details",
  "process-item-details",
  "material-request",
  "consumption-log",
  "timeline",
  "cost-report",
];

export default function ProductionBatchDetailPage({ batchData: initialBatchData, errorMsg }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [batchData, setBatchData] = useState(initialBatchData);
  const { activeTab, getTabHref } = useTabNavigation({
    moduleKey: "production-batch",
    entityId: initialBatchData?.id,
    defaultTab: "summary",
    validTabs: VALID_TABS,
  });
  const [processDrawerState, setProcessDrawerState] = useState({ isOpen: false, processExecutionId: null });
  const [sideDrawerState, setSideDrawerState] = useState({ isOpen: false, moduleName: null, id: null });
  const [isMarking, setIsMarking] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    setBatchData(initialBatchData);
  }, [initialBatchData]);

  const refreshBatchData = async () => {
    const targetId = batchData?.id || initialBatchData?.id;
    if (!targetId) return;
    try {
      const res = await getProductionBatchDetails({ id: targetId });
      if (res?.success === 1 || res?.settings?.success === 1) {
        const data = res?.data || res?.settings?.data;
        if (data) {
          setBatchData(data);
        }
      }
    } catch (err) {
      console.error("Error refreshing batch data:", err);
    }
    router.refresh();
  };

  const handleMarkCompleted = async () => {
    setIsConfirmModalOpen(false);
    const targetId = batchData?.id || initialBatchData?.id;
    if (!targetId) return;
    setIsMarking(true);
    try {
      const res = await markBatchCompleted({ batchId: targetId });
      if (res?.settings?.success === 1 || res?.success === 1) {
        await refreshBatchData();
      }
    } catch (err) {
      console.error("Error marking batch as completed:", err);
    } finally {
      setIsMarking(false);
    }
  };

  const handleCancelBatch = async () => {
    setIsCancelModalOpen(false);
    const targetId = batchData?.id || initialBatchData?.id;
    if (!targetId) return;
    setIsCancelling(true);
    try {
      const res = await cancelProductionBatch({ id: targetId });
      const success = res?.settings?.success === 1 || res?.success === 1;
      const msg = res?.settings?.message || res?.message;
      if (success) {
        toast.success(msg || "Batch cancelled successfully");
        window.location.reload();
      } else {
        toast.error(msg || "Failed to cancel batch");
      }
    } catch (err) {
      console.error("Error cancelling batch:", err);
      toast.error("An error occurred while cancelling batch");
    } finally {
      setIsCancelling(false);
    }
  };

  const processes = batchData?.processes || [];
  const allCompleted =
    processes.length > 0 &&
    processes.every((p) => p.status === "Completed" || p.status === "Skipped");
  const isBatchCompleted =
    batchData?.status === "Completed" ||
    Boolean(batchData?.markCompleted);
  const isBatchCancelled = batchData?.status === "Cancelled";
  const isBatchInactive = isBatchCompleted || isBatchCancelled;

  const canCancelBatch =
    (batchData?.status === "Pending" || batchData?.status === "StockReceived") &&
    can(CAPABILITIES.PRODUCTION_BATCH?.DELETE || "PRODUCTION_BATCH_DELETE");

  useEffect(() => {
    const actionButtons = [];

    if (
      batchData?.id &&
      !isBatchInactive &&
      can(CAPABILITIES.MATERIAL_REQUEST?.CREATE || "MATERIAL_REQUEST_CREATE")
    ) {
      actionButtons.push({
        label: "Request Material",
        href: buildRoute("production-batch", "materialRequestCreate", { id: batchData.id }),
      });
    }

    if (allCompleted && !isBatchInactive) {
      actionButtons.push({
        label: isMarking ? "Completing..." : "Mark Batch Completed",
        onClick: () => setIsConfirmModalOpen(true),
        disabled: isMarking,
      });
    }

    if (canCancelBatch) {
      actionButtons.push({
        label: isCancelling ? "Cancelling..." : "Cancel Batch",
        onClick: () => setIsCancelModalOpen(true),
        disabled: isCancelling,
      });
    }

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
        title: "Details",
        breadcrumbs: [
          { label: "Production", },
          { label: "Production Batch", href: buildRoute("production-batch", "list") },
        ],
        actionButtons,
      },
    });
    return () => resetConfig();
  }, [
    setConfig,
    resetConfig,
    batchData,
    isBatchInactive,
    allCompleted,
    isMarking,
    canCancelBatch,
    isCancelling,
    can,
    router,
  ]);

  if (errorMsg) {
    return (
      <div className="p-8 text-center text-red-500">
        {errorMsg}
      </div>
    );
  }

  if (batchData?.accessDenied) {
    return <AccessDenied missingPermission={batchData.requiredPermission || CAPABILITIES.PRODUCTION_BATCH?.VIEW} />;
  }

  if (!batchData) return <Loader fullPage />;

  const handleOpenProcessDrawer = (processId) => {
    const processData = (batchData.processes || []).find(
      (p) => Number(p.processId) === Number(processId) || Number(p.id) === Number(processId)
    );
    if (processData) {
      setProcessDrawerState({ isOpen: true, processExecutionId: processData.id });
    }
  };

  const handleOpenDrawer = (moduleName, id) => {
    if (moduleName && id) {
      setSideDrawerState({ isOpen: true, moduleName, id });
    }
  };
  console.log("batchData in ProductionBatchDetailPage:", batchData);
  return (
    <div className="h-full">
      <div className="flex gap-6 items-start h-full ps-10 pt-2 ">
        <ProductionBatchSidebar
          batchData={batchData}
          activeTab={activeTab}
          getTabHref={getTabHref}
        />

        <div className="flex-1 w-full h-full overflow-y-scroll pe-10">
          {activeTab === "summary" && (
            <ProductionBatchSummaryTab
              batchData={batchData}
              handleOpenProcessDrawer={handleOpenProcessDrawer}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "item-details" && (
            <ProductionBatchItemDetailsTab
              materialDetails={batchData.materialDetails}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "process-item-details" && (
            <ProductionBatchProcessItemDetailsTab
              batchData={batchData}
              handleOpenProcessDrawer={handleOpenProcessDrawer}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "material-request" && (
            <ProductionBatchMaterialRequestTab
              batchData={batchData}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "consumption-log" && (
            <ProductionBatchConsumptionLogTab
              processLogs={batchData.processLogs || []}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "timeline" && (
            <ProductionBatchTimelineTab
              timelineEvents={batchData.timelineEvents || []}
              processes={batchData.processes || []}
              handleOpenProcessDrawer={handleOpenProcessDrawer}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "cost-report" && (
            <ProductionBatchCostReportTab
              batchCost={batchData.batchCost}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {!VALID_TABS.includes(activeTab) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">
                {activeTab.replace("-", " ")}
              </h3>
              <p className="text-xs text-gray-500">
                Details view for this section will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>

      <ProductionBatchProcessDrawer
        open={processDrawerState.isOpen}
        onClose={() => setProcessDrawerState({ isOpen: false, processExecutionId: null })}
        batchId={batchData?.id}
        batchData={batchData}
        processExecutionId={processDrawerState.processExecutionId}
        onProcessUpdated={refreshBatchData}
      />

      <SideDrawer
        open={sideDrawerState.isOpen}
        onClose={() => setSideDrawerState({ isOpen: false, moduleName: null, id: null })}
        moduleName={sideDrawerState.moduleName}
        mode="details"
        data={sideDrawerState.id ? { id: sideDrawerState.id } : null}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Batch Completion"
        message="Are you sure you want to mark this production batch as completed?"
        confirmLabel="Mark Completed"
        onConfirm={handleMarkCompleted}
        onCancel={() => setIsConfirmModalOpen(false)}
        danger={false}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Production Batch"
        message="Are you sure you want to cancel this batch?"
        confirmLabel="Cancel Batch"
        onConfirm={handleCancelBatch}
        onCancel={() => setIsCancelModalOpen(false)}
        danger={true}
      />
    </div>
  );
}

