"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import SideDrawer from "@/components/common/SideDrawer";
import ConfirmModal from "@/components/common/ConfirmModal";
import AccessDenied from "@/components/common/AccessDenied";
import Loader from "@/components/common/Loader";
import NoDataMessage from "@/components/common/NoDataMessage";
import toast from "react-hot-toast";

import {
  getMaterialRequest,
  markMaterialRequestDelivered,
  cancelMaterialRequest,
} from "@/lib/api/material-request-api";
import {
  Package,
  CheckCircle,
  XCircle,
  Edit,
  FileText,
  Download,
  Layers,
  SquareArrowOutUpRight,
} from "lucide-react";

function DetailRow({
  label,
  value,
  href,
  onClick,
  valueNode,
  valueClassName = "",
}) {
  if (!value && !valueNode && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {valueNode ? (
        valueNode
      ) : href ? (
        <ModuleLink
          href={href}
          onClick={onClick}
          className="text-[#1565c0] font-medium text-sm text-right"
        >
          {displayFormat(value)}
        </ModuleLink>
      ) : (
        <span className={`text-sm font-medium text-right ${valueClassName}`}>
          {displayFormat(value)}
        </span>
      )}
    </div>
  );
}

function UserInfoCard({ title, name, date, href, onClick }) {
  if (!name && !date && !href) return null;
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          {href ? (
            <ModuleLink
              href={href}
              onClick={onClick}
              className="text-sm font-semibold text-[#1565c0]"
            >
              {displayFormat(name)}
            </ModuleLink>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              {displayFormat(name)}
            </span>
          )}
          {date && (
            <span className="text-xs text-gray-400 mt-1">
              {displayFormat(date, "DATE")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaterialRequestDetailPage({ id, initialData = null }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedPlantForDetails, setSelectedPlantForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const canViewPlant = can(CAPABILITIES.PLANT?.VIEW || "PLANT_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canUpdate = can(
    CAPABILITIES.MATERIAL_REQUEST?.UPDATE || "MATERIAL_REQUEST_UPDATE",
  );

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getMaterialRequest({ id });
      const mrData = res?.settings?.data || res?.data;
      if (mrData) {
        setData(mrData);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
      toast.error("Failed to load Material Request details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData && id) {
      fetchDetails();
    }
  }, [id, initialData]);

  const isPending = data?.status === "Pending";

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
          { label: "Production", },
          {
            label: "Material Request",
            href: buildRoute("material-request", "list"),
          },
        ],
        actionButtons: [
          ...(canUpdate && isPending && data?.id
            ? [
              // {
              //   label: "Edit",
              //   onClick: () =>
              //     router.push(
              //       buildRoute("material-request", "edit", { id: data.id }),
              //     ),
              // },
              {
                label: "Mark Delivered",
                onClick: () => setConfirmAction("deliver"),
              },
              {
                label: "Cancel Request",
                onClick: () => setConfirmAction("cancel"),
              },
            ]
            : []),
        ],
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, resetConfig, router, canUpdate, isPending, data?.id]);

  if (loading) {
    return <Loader overlay />;
  }

  if (!data || data.success === 0 || data.settings?.success === 0) {
    if (data?.accessDenied) {
      return (
        <AccessDenied
          missingPermission={
            CAPABILITIES.MATERIAL_REQUEST?.VIEW || "MATERIAL_REQUEST_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500 text-sm">
        Material Request details could not be loaded.
      </div>
    );
  }

  const handleDeliver = async () => {
    try {
      setActionLoading(true);
      const res = await markMaterialRequestDelivered({ id: data.id });
      if (res?.settings?.success === 1 || res?.success === 1) {
        toast.success(
          res?.settings?.message || "Material Request marked as delivered!",
        );
        fetchDetails();
      } else {
        toast.error(
          res?.settings?.message ||
          res?.message ||
          "Failed to mark as delivered.",
        );
      }
    } catch (err) {
      toast.error("Failed to process delivery.");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      const res = await cancelMaterialRequest({ id: data.id });
      if (res?.settings?.success === 1 || res?.success === 1) {
        toast.success(
          res?.settings?.message || "Material Request cancelled successfully!",
        );
        fetchDetails();
      } else {
        toast.error(
          res?.settings?.message ||
          res?.message ||
          "Failed to cancel Material Request.",
        );
      }
    } catch (err) {
      toast.error("Failed to cancel material request.");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };
  console.log("MaterialRequestDetailPage data:", data);
  if (actionLoading) {
    return <Loader overlay />;
  }
  return (
    <div className="h-full ">
      <div className="grid grid-cols-12 gap-6 h-full ms-10 ">
        <div className="col-span-2 rounded-xl bg-white  hover:shadow-lg transition mb-16">
          <div className="  p-5 ">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900 font-mono">
                {displayFormat(data.code)}
              </h2>
              <div className="mt-2">
                <StatusBadge status={data.status} />
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <button className="w-full bg-[#1565c0] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6]">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-10 overflow-y-scroll h-full pe-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">

              <div className="space-y-1">
                <DetailRow label="Plant" value={data.plantName} />
                <DetailRow label="Warehouse" value={data.warehouseName} />
                {data.batchCode && (
                  <DetailRow label="Production Batch" value={data.batchCode} />
                )}
                <DetailRow
                  label="Status"
                  valueNode={<StatusBadge status={data.status} />}
                />
                <DetailRow label="Remarks" value={data.remark} />
              </div>
            </div>

            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">
                Item Details Info
              </h3>
              <div className="space-y-1">
                <DetailRow
                  label="Total Items"
                  value={data.items?.length || 0}
                />
                <DetailRow
                  label="Total Requested Qty"
                  value={displayFormat(data.requestedQtySumFormatted)}
                  valueClassName="font-mono"
                />
                <DetailRow
                  label="Total Received Qty"
                  value={displayFormat(data.receivedQtySumFormatted)}
                  valueClassName="font-mono"
                />
                <DetailRow
                  label="Requested Date"
                  value={data.requestedDateFormatted}
                />
                <DetailRow
                  label="Delivered Date"
                  value={data.deliveredDateFormatted}
                />
              </div>
            </div>

            <div className="xl:col-span-1 space-y-6">
              <UserInfoCard
                title="Requested By"
                name={data.requestedByName}
                date={data.requestedDateFormatted}
                href={
                  canViewUser && data.requestedBy
                    ? buildRoute("user", "detail", { id: data.requestedBy })
                    : null
                }
                onClick={
                  canViewUser && data.requestedBy
                    ? () =>
                      setSelectedUserForDetails({ userId: data.requestedBy })
                    : null
                }
              />
            </div>
          </div>

          <div className="bg-white rounded-xl hover:shadow-lg transition p-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-6">
              Item Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 border-b border-gray-100 text-xs font-semibold text-gray-700 ">
                    <th className="px-4 py-3">Sr. No.</th>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Item Code</th>
                    <th className="px-4 py-3">UOM</th>
                    <th className="px-4 py-3 text-right">Requested Qty</th>
                    <th className="px-4 py-3 text-right">Received Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {data.items && data.items.length > 0 ? (
                    data.items.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{idx + 1}</td>
                        <td className="px-4 py-3">
                          {item.itemImageUrl ? (
                            <SharedImageZoom
                              id={`mr-item-${item.id}`}
                              src={item.itemImageUrl}
                              alt={item.itemName}
                              thumbnailClassName="w-10 h-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <Layers size={18} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3  ">
                          {displayFormat(item.itemName)}
                        </td>
                        <td className="px-4 py-3   ">
                          {displayFormat(item.itemCode)}
                        </td>
                        <td className="px-4 py-3 ">
                          {displayFormat(item.uomName)}
                        </td>
                        <td className="px-4 py-3   text-right">
                          {displayFormat(
                            item.requestedQty,
                          )}
                        </td>
                        <td className="px-4 py-3   text-right">
                          {displayFormat(
                            item.receivedQty,
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        No material items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-6 w-full">
            <div className="flex-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">
                Attachments
              </h3>
              <div className="max-h-60 overflow-y-auto pr-1">
                {data.attachments && data.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {data.attachments.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-300 rounded-lg text-xs hover:border-blue-300 transition"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <FileText
                            className="text-[#1565c0] shrink-0"
                            size={20}
                          />
                          <div className="truncate">
                            <p className="font-semibold text-gray-800 truncate">
                              {displayFormat(
                                att.originalFileName || att.fileName,
                              )}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {(att.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        {att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#1565c0] hover:bg-blue-100/50 rounded-md transition cursor-pointer"
                            title=" View"
                          >
                            <SquareArrowOutUpRight size={16} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <NoDataMessage moduleName="Attachments" />
                )}
              </div>
            </div>
            <div className="flex-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">
                Remark
              </h3>
              <div className="max-h-60 overflow-y-auto pr-1 text-sm text-gray-700">
                {data.remark ? (
                  <p className="whitespace-pre-wrap">{displayFormat(data.remark)}</p>
                ) : (
                  <NoDataMessage moduleName="Remark" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmAction === "deliver"}
        actionType="update"
        entityName="Material Request"
        title="Mark as Delivered"
        message="Are you sure you want to mark this Material Request as Delivered?"
        confirmLabel="Mark Delivered"
        onConfirm={handleDeliver}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        isOpen={confirmAction === "cancel"}
        actionType="delete"
        entityName="Material Request"
        title="Cancel Material Request"
        message="Are you sure you want to cancel this Material Request?"
        confirmLabel="Cancel Request"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirmAction(null)}
      />

      <SideDrawer
        open={!!selectedPlantForDetails}
        onClose={() => setSelectedPlantForDetails(null)}
        moduleName="Plant"
        mode="details"
        data={
          selectedPlantForDetails
            ? { id: selectedPlantForDetails.plantId }
            : null
        }
      />

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={
          selectedUserForDetails ? { id: selectedUserForDetails.userId } : null
        }
      />
    </div>
  );
}
