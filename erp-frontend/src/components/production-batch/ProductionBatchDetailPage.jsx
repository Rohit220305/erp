"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import Loader from "@/components/common/Loader";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import ProductionBatchProcessDrawer from "./ProductionBatchProcessDrawer";
import ProductionBatchSidebar from "./details/ProductionBatchSidebar";
import ProductionBatchSummaryTab from "./details/ProductionBatchSummaryTab";
import ProductionBatchItemDetailsTab from "./details/ProductionBatchItemDetailsTab";
import ProductionBatchProcessItemDetailsTab from "./details/ProductionBatchProcessItemDetailsTab";
import ProductionBatchMaterialRequestTab from "./details/ProductionBatchMaterialRequestTab";

export default function ProductionBatchDetailPage({ batchData, errorMsg }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState("SUMMARY");
  const [processDrawerState, setProcessDrawerState] = useState({ isOpen: false, processData: null });
  const [sideDrawerState, setSideDrawerState] = useState({ isOpen: false, moduleName: null, id: null });

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
        title: "Details",
        breadcrumbs: [
          { label: "Master", href: buildRoute("home", "list") },
          { label: "Production Batches", href: buildRoute("production-batch", "list") },
        ],
        actionButton: batchData?.id && can(CAPABILITIES.MATERIAL_REQUEST?.CREATE || "MATERIAL_REQUEST_CREATE")
          ? {
              label: "Request Material",
              onClick: () => router.push(buildRoute("production-batch", "materialRequestCreate", { id: batchData.id })),
            }
          : null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, batchData?.id, can, router]);

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
      setProcessDrawerState({ isOpen: true, processData });
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
      <div className="flex gap-6 items-start h-full ps-10 pt-2">
        <ProductionBatchSidebar
          batchData={batchData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 w-full h-full overflow-y-scroll pe-10">
          {activeTab === "SUMMARY" && (
            <ProductionBatchSummaryTab
              batchData={batchData}
              handleOpenProcessDrawer={handleOpenProcessDrawer}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "ITEM_DETAILS" && (
            <ProductionBatchItemDetailsTab
              materialDetails={batchData.materialDetails}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "PROCESS_ITEM_DETAILS" && (
            <ProductionBatchProcessItemDetailsTab
              batchData={batchData}
              handleOpenProcessDrawer={handleOpenProcessDrawer}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab === "MATERIAL_REQUEST" && (
            <ProductionBatchMaterialRequestTab
              batchData={batchData}
              onOpenDrawer={handleOpenDrawer}
            />
          )}

          {activeTab !== "SUMMARY" &&
            activeTab !== "ITEM_DETAILS" &&
            activeTab !== "PROCESS_ITEM_DETAILS" &&
            activeTab !== "MATERIAL_REQUEST" && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  {activeTab.replace("_", " ")}
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
        onClose={() => setProcessDrawerState({ isOpen: false, processData: null })}
        processData={processDrawerState.processData}
      />

      <SideDrawer
        open={sideDrawerState.isOpen}
        onClose={() => setSideDrawerState({ isOpen: false, moduleName: null, id: null })}
        moduleName={sideDrawerState.moduleName}
        mode="details"
        data={sideDrawerState.id ? { id: sideDrawerState.id } : null}
      />
    </div>
  );
}
