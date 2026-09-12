"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import SideDrawer from "@/components/common/SideDrawer";
import ProductionOrderMaterialTabs from "./ProductionOrderMaterialTabs";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
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

export default function ProductionOrderDetailPage({ data }) {
  const router = useRouter();
  const { can } = useAuth();
  const { setConfig, resetConfig } = useHeader();

  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    moduleName: null,
    id: null,
  });

  const orderData = data?.data || data?.settings?.data || data;
  console.log("ProductionOrderDetailPage - orderData:", orderData);
  const canEdit = can(CAPABILITIES.PRODUCTION_ORDER?.UPDATE || "PRODUCTION_ORDER_UPDATE");
  const canViewItem = can(CAPABILITIES.ITEM?.VIEW || "ITEM_VIEW");
  const canViewBom = can(CAPABILITIES.BOM?.VIEW || "BOM_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canCreateBatch = can(CAPABILITIES.PRODUCTION_BATCH?.CREATE || "PRODUCTION_BATCH_CREATE");

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
          { label: "Production Orders", href: buildRoute("production-order", "list") },
        ],
        actionButtons: [
          ...(canEdit && orderData?.id
            ? [
                {
                  label: "Edit",
                  onClick: () => router.push(buildRoute("production-order", "edit", { id: orderData.id })),
                },
              ]
            : []),
          ...(canCreateBatch
            ? [
                {
                  label: "Create Batch",
                  onClick: () => router.push(`/production-batch/create/${orderData.id}`),
                },
              ]
            : []),
        ],
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, resetConfig, router, orderData?.id, orderData?.productionOrderCode, canEdit]);

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

  console.log(orderData);
  return (
    <div className="py-6 px-10 max-h-full overflow-y-auto">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900">
                {orderData.productionOrderCode}
              </h2>
              <div className="mt-2">
                <StatusBadge status={orderData.status || "—"} />
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-3">
              <button className="w-full bg-[#1565c0] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6]">
                Summary
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10 space-y-6">
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
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {orderData.productionOrderCode}
                  </h3>
                  {canViewItem && orderData.itemId ? (
                    <ModuleLink
                      href={buildRoute("item", "detail", {
                        id: orderData.itemId,
                      })}
                      onClick={() => handleOpenDrawer("Item", orderData.itemId)}
                      className="text-xs font-medium text-[#1565c0] hover:underline cursor-pointer truncate block"
                    >
                      {orderData.itemName}
                    </ModuleLink>
                  ) : (
                    <span className="text-xs font-medium text-gray-700 truncate block">
                      {orderData.itemName}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Item Code</span>
                  <span className="font-mono font-medium text-gray-800">
                    {orderData.itemCode || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">BOM Code</span>
                  {canViewBom && orderData.bomId ? (
                    <ModuleLink
                      href={buildRoute("bom", "detail", {
                        id: orderData.bomId,
                      })}
                      onClick={() => handleOpenDrawer("Bom", orderData.bomId)}
                      className="font-mono font-medium text-[#1565c0] hover:underline cursor-pointer"
                    >
                      {orderData.bomCode || orderData.bomName || "—"}
                    </ModuleLink>
                  ) : (
                    <span className="font-mono font-medium text-gray-800">
                      {orderData.bomCode || orderData.bomName || "—"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Production Date</span>
                  <span className="font-medium text-gray-800">
                    {orderData.productionDateFormatted || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quantity Details
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <tbody className="divide-y divide-gray-100">
                    {/* <tr>
                      <td className="py-1.5 text-gray-500 font-sans">
                        Produced Qty
                      </td>
                      <td className="py-1.5 text-right font-bold text-gray-900">
                        {orderData.productionQuantityDisplay}
                      </td>
                    </tr> */}
                    <tr>
                      <td className="py-1.5 text-gray-500 font-sans">
                        Package Qty
                      </td>
                      <td className="py-1.5 text-right font-bold text-[#1565c0]">
                        {orderData.packageQuantityDisplay}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-gray-500 font-sans">
                        Pending Qty
                      </td>
                      <td className="py-1.5 text-right font-bold text-orange-600">
                        {orderData.pendingQuantityDisplay ||
                          orderData.productionQuantityDisplay}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 text-gray-500 font-sans">
                        No. of Batches
                      </td>
                      <td className="py-1.5 text-right font-semibold text-purple-600">
                        {orderData.batchCount || 0}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Cost Details
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Unit Cost</span>
                  <span className="font-bold text-gray-900">
                    {orderData.itemCostPerUnitFormatted || "₦ 0.00"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Estimated Total</span>
                  <span className="font-bold text-gray-900">
                    {orderData.estimatedTotalCostFormatted || "₦ 0.00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Requested By
              </h4>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-[#1565c0] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
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
                        userId ? () => handleOpenDrawer("User", userId) : null
                      }
                      className="text-xs font-bold text-[#1565c0] hover:underline cursor-pointer block truncate"
                    >
                      {orderData.addedByName || "System"}
                    </ModuleLink>
                  ) : (
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {orderData.addedByName || "System"}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {orderData.addedDateFormatted || "—"}
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
            packageQuantity={orderData.packageQuantity || 1}
            currencySymbol={orderData.currencySymbol || "₦"}
            showToggle={true}
            onOpenDrawer={handleOpenDrawer}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" /> Remarks
              </h3>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                {orderData.remark || "No Remarks found."}
              </p>
            </div>

            <div className="bg-white rounded-xl hover:shadow-lg transition p-6 space-y-3">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-gray-400" /> Attachments
              </h3>

              {!orderData.attachments || orderData.attachments.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No Attachments found.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {orderData.attachments.map((file, idx) => (
                    <a
                      key={file.id || idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-blue-50/60 rounded-lg border border-gray-200 hover:border-blue-200 text-xs group transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <FileText className="w-4 h-4 text-[#1565c0] shrink-0" />
                        <span className="font-medium text-gray-800 group-hover:text-[#1565c0] truncate transition-colors">
                          {file.originalName ||
                            file.filename ||
                            `Attachment-${idx + 1}`}
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
    </div>
  );
}
