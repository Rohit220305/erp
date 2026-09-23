"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useTabNavigation from "@/hooks/useTabNavigation";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import SideDrawer from "@/components/common/SideDrawer";
import ProductionOrderMaterialTabs from "./ProductionOrderMaterialTabs";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";
import NoDataMessage from "@/components/common/NoDataMessage";
import StatusBadge from "@/components/common/StatusBadge";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import {
  Package,
  FileText,
  Download,
  Paperclip,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

import { listProductionBatch } from "@/lib/api/production-batch-api";
import { cancelProductionOrder } from "@/lib/api/production-order-api";
import ConfirmModal from "@/components/common/ConfirmModal";
import { toast } from "react-hot-toast";
import ProductionBatchGridCard from "@/components/production-batch/ProductionBatchGridCard";
import { formatCurrency } from "@/utils/number-formatter";

const VALID_TABS = ["summary", "batches"];

export default function ProductionOrderDetailPage({ data }) {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();

  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    moduleName: null,
    id: null,
  });

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const orderData = data?.data || data?.settings?.data || data;

  const { activeTab, getTabHref } = useTabNavigation({
    moduleKey: "production-order",
    entityId: orderData?.id,
    defaultTab: "summary",
    validTabs: VALID_TABS,
  });

  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [batchesLoaded, setBatchesLoaded] = useState(false);
  const canEdit = can(CAPABILITIES.PRODUCTION_ORDER?.UPDATE || "PRODUCTION_ORDER_UPDATE");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canCreateBatch = can(CAPABILITIES.PRODUCTION_BATCH?.CREATE || "PRODUCTION_BATCH_CREATE");
  const canDeleteOrder = can(CAPABILITIES.PRODUCTION_ORDER?.DELETE || "PRODUCTION_ORDER_DELETE");

  const canCancelOrder =
    canDeleteOrder &&
    (orderData?.status === "Pending" ||
      (orderData?.status === "InProgress" && Number(orderData?.pendingQuantity) > 0));

  const handleCancelOrder = async () => {
    setIsCancelModalOpen(false);
    if (!orderData?.id) return;
    setIsCancelling(true);
    try {
      const res = await cancelProductionOrder({ id: orderData.id });
      const success = res?.settings?.success === 1 || res?.success === 1;
      const msg = res?.settings?.message || res?.message;
      if (success) {
        toast.success(msg || "Production order cancelled successfully");
        window.location.reload();
      } else {
        toast.error(msg || "Failed to cancel production order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      toast.error("An error occurred while cancelling order");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    const hasBatches = Number(orderData?.batchCount) > 0;

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
          { label: "Production Orders", href: buildRoute("production-order", "list") },
        ],
        actionButtons: [
          ...(canEdit && orderData?.id && !hasBatches && orderData?.status !== "Cancelled" && orderData?.status !== "Completed" && orderData?.status !== "PartialCancelled" && orderData?.status !== "Partially Cancelled"
            ? [
              {
                label: "Edit",
                onClick: () => router.push(buildRoute("production-order", "edit", { id: orderData.id })),
              },
            ]
            : []),
          ...(canCreateBatch && Number(orderData?.pendingQuantity) > 0 && orderData?.status !== "Cancelled" && orderData?.status !== "Completed" && orderData?.status !== "PartialCancelled" && orderData?.status !== "Partially Cancelled"
            ? [
              {
                label: "Create Batch",
                onClick: () => router.push(`/production-batch/create/${orderData.id}`),
              },
            ]
            : []),
          ...(canCancelOrder
            ? [
              {
                label: isCancelling ? "Cancelling..." : "Cancel Order",
                onClick: () => setIsCancelModalOpen(true),
                disabled: isCancelling,
              },
            ]
            : []),
        ],
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, resetConfig, router, orderData?.id, orderData?.productionOrderCode, orderData?.batchCount, orderData?.status, orderData?.pendingQuantity, canEdit, canCreateBatch, canCancelOrder, isCancelling]);

  useEffect(() => {
    if (activeTab === "batches" && orderData?.id && !batchesLoaded) {
      setIsLoadingBatches(true);
      listProductionBatch({ productionOrderId: orderData.id, limit: 100 })
        .then((res) => {
          if (res?.success === 1 || res?.settings?.success === 1) {
            const dataObj = res?.settings?.data || res?.data || {};
            setBatches(dataObj.list || dataObj.items || []);
            setBatchesLoaded(true);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch batches", err);
        })
        .finally(() => {
          setIsLoadingBatches(false);
        });
    }
  }, [activeTab, orderData?.id, batchesLoaded]);

  if (!orderData) {
    return (
      <div className="p-6 text-gray-500 text-center font-medium">
        Production Order data unavailable.
      </div>
    );
  }

  const handleOpenDrawer = (moduleName, id) => {
    if (!id) return;
    setDrawerState({ isOpen: true, moduleName, id });
  };



  const userId = orderData.addedBy || orderData.addedById || orderData.added_by || orderData.createdBy;
  const userInitial = orderData.addedByName ? orderData.addedByName.charAt(0).toUpperCase() : "U";

  return (
    <div className="py-6  h-full ">
      <div className="grid grid-cols-12 gap-6 h-full">
        <div className="col-span-12 lg:col-span-2 h-full ms-10">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5 h-full">
            <div className="mb-4">
              <h2 className="  text-base text-gray-900">
                {orderData.productionOrderCode}
              </h2>
              <div className="mt-2">
                <StatusBadge status={orderData.status} />
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-1">
              <Link
                href={getTabHref("summary")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === "summary"
                  ? "bg-[#1565c0] text-white shadow-sm  "
                  : "text-gray-700 hover:bg-gray-100/70"
                  }`}
              >
                <FileText
                  size={16}
                  className={
                    activeTab === "summary" ? "text-white" : "text-gray-500"
                  }
                />
                <span>Summary</span>
              </Link>
              <Link
                href={getTabHref("batches")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${activeTab === "batches"
                  ? "bg-[#1565c0] text-white shadow-sm  "
                  : "text-gray-700 hover:bg-gray-100/70"
                  }`}
              >
                <Package
                  size={16}
                  className={
                    activeTab === "batches" ? "text-white" : "text-gray-500"
                  }
                />
                <span>Batch Details</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10 space-y-6 h-full overflow-y-scroll pe-10">
          {activeTab === "summary" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                    <SharedImageZoom
                      id={`po-item-${orderData?.id}`}
                      src={orderData?.itemImageUrl}
                      alt={orderData?.itemName || "Item Image"}
                      thumbnailClassName="w-12 h-12 rounded-lg border border-gray-200 object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="  text-sm text-gray-900 truncate">
                        {orderData.productionOrderCode}
                      </h3>
                      {canViewItem && orderData.itemId ? (
                        <ModuleLink
                          href={buildRoute("item", "detail", {
                            id: orderData.itemId,
                          })}
                          onClick={() =>
                            handleOpenDrawer("Item", orderData.itemId)
                          }
                          className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer truncate block"
                        >
                          {displayFormat(orderData.itemName)}
                        </ModuleLink>
                      ) : (
                        <span className="text-sm font-medium text-gray-700 truncate block">
                          {displayFormat(orderData.itemName)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Item Code</span>
                      <span className="font-mono font-medium text-gray-800">
                        {displayFormat(orderData.itemCode)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">BOM Name</span>
                      {canViewBom && orderData.bomId ? (
                        <ModuleLink
                          href={buildRoute("bom", "detail", {
                            id: orderData.bomId,
                          })}
                          onClick={() =>
                            handleOpenDrawer("Bom", orderData.bomId)
                          }
                          className="font-mono font-medium text-[#1565c0] hover:underline cursor-pointer"
                        >
                          {displayFormat(orderData.bomName)}
                        </ModuleLink>
                      ) : (
                        <span className="font-mono font-medium text-gray-800">
                          {displayFormat(orderData.bomName)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Production Date</span>
                      <span className="font-medium text-gray-800">
                        {displayFormat(
                          orderData.productionDateFormatted,
                          "DATE",
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">No. of Batches</span>
                      <span className="font-medium text-gray-800">
                        {displayFormat(orderData.batchCount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Customer Name</span>
                      <span className="font-medium text-gray-800">
                        {displayFormat(orderData.customerName)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
                  <h4 className="text-sm   text-gray-500   tracking-wider">
                    Quantity Details
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-mono">
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="py-1.5 text-gray-500 font-sans">
                            Requested Qty
                          </td>
                          <td className="py-1.5 text-right   ">
                            {displayFormat(orderData.productionQuantityDisplay)}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-1.5 text-gray-500 font-sans">
                            Pending Qty
                          </td>
                          <td className="py-1.5 text-right   ">
                            {displayFormat(orderData.pendingQuantityDisplay)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-gray-500 font-sans">
                            In-Progress Qty
                          </td>
                          <td className="py-1.5 text-right   ">
                            {displayFormat(orderData.inProgressQuantityDisplay)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-gray-500 font-sans">
                            Produced Qty
                          </td>
                          <td className="py-1.5 text-right   ">
                            {displayFormat(orderData.producedQuantityDisplay)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
                  <h4 className="text-sm   text-gray-500   tracking-wider">
                    Cost Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Unit Cost</span>
                      <span className="  text-gray-900">
                        {displayFormat(orderData.itemCostPerUnitFormatted)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Estimated Total</span>
                      <span className="  text-gray-900">
                        {displayFormat(orderData.estimatedTotalCostFormatted)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
                  <h4 className="text-sm   text-gray-500   tracking-wider">
                    Requested By
                  </h4>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-[#1565c0] text-white flex items-center justify-center   text-sm shadow-sm shrink-0">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      {canViewUser ? (
                        <ModuleLink
                          href={
                            userId
                              ? buildRoute("user", "detail", { id: userId })
                              : buildRoute("user", "list")
                          }
                          onClick={
                            userId
                              ? () => handleOpenDrawer("User", userId)
                              : null
                          }
                          className="text-sm   text-[#1565c0] hover:underline cursor-pointer block truncate"
                        >
                          {displayFormat(orderData.addedByName)}
                        </ModuleLink>
                      ) : (
                        <p className="text-sm   text-gray-900 truncate">
                          {displayFormat(orderData.addedByName)}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 font-medium mt-0.5">
                        {displayFormat(orderData.addedDateFormatted, "DATE")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ProductionOrderMaterialTabs
                materialDetails={
                  orderData.materialDetails || {
                    rawMaterials: [],
                    semiFinished: [],
                    finishedProducts: [],
                  }
                }
                packageQuantity={orderData.packageQuantity}
                currencySymbol={orderData.currencySymbol}
                showToggle={true}
                onOpenDrawer={handleOpenDrawer}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
                  <h3 className="text-sm   text-gray-600   tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" /> Remark
                  </h3>
                  {orderData.remark ? (
                    <p className="text-sm text-gray-400 font-medium ">
                      {displayFormat(orderData.remark)}
                    </p>
                  ) : (
                    <div>
                      <NoDataMessage moduleName="Remark" />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3 ">
                  <h3 className="text-sm   text-gray-600   tracking-wider flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-400" /> Attachments
                  </h3>

                  {!orderData.attachments ||
                    orderData.attachments.length === 0 ? (
                    <div>
                      <NoDataMessage moduleName="Attachment" />
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {orderData.attachments.map((file, idx) => (
                        <a
                          key={file.id || idx}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-blue-50/60 rounded-lg border border-gray-200 hover:border-blue-200 text-sm group transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText className="w-4 h-4 text-[#1565c0] shrink-0" />
                            <span className="font-medium text-gray-800 group-hover:text-[#1565c0] truncate transition-colors">
                              {displayFormat(
                                file.originalName ||
                                file.filename ||
                                `Attachment-${idx + 1}`,
                              )}
                            </span>
                          </div>
                          <span className="p-1 text-gray-400 group-hover:text-[#1565c0] transition-colors shrink-0">
                            <ExternalLink size={15} />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "batches" && (
            <div className="space-y-4 bg-white rounded-xl p-6">
              <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                Batch Details
              </h3>
              {isLoadingBatches ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1565c0] mx-auto mb-3"></div>
                  <p className="text-sm font-medium">Loading batches...</p>
                </div>
              ) : batches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {batches.map((batch) => (
                    <ProductionBatchGridCard
                      key={batch.id}
                      item={batch}
                      setSelectedBatchForDetails={(b) =>
                        handleOpenDrawer("ProductionBatch", b.id || b.batchId)
                      }
                      setSelectedItemForDetails={({ itemId }) =>
                        handleOpenDrawer("Item", itemId)
                      }
                      setSelectedBomForDetails={({ bomId }) =>
                        handleOpenDrawer("Bom", bomId)
                      }
                      setSelectedUserForDetails={({ addedBy }) =>
                        handleOpenDrawer("User", addedBy)
                      }
                      onRefresh={() => {
                        setBatchesLoaded(false);
                        refreshOrderData();
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="   p-10 text-center ">
                  <NoDataMessage moduleName="Batch Details" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SideDrawer
        open={drawerState.isOpen}
        onClose={() =>
          setDrawerState({ isOpen: false, moduleName: null, id: null })
        }
        moduleName={drawerState.moduleName}
        mode="details"
        data={drawerState.id ? { id: drawerState.id } : null}
      />

      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Cancel Production Order"
        message="Are you sure you want to cancel this production order?"
        confirmLabel="Cancel Order"
        onConfirm={handleCancelOrder}
        onCancel={() => setIsCancelModalOpen(false)}
        danger={true}
      />
    </div>
  );
}
