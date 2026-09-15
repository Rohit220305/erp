import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import {
  listMaterialRequests,
  markMaterialRequestDelivered,
  cancelMaterialRequest
} from "@/lib/api/material-request-api";
import Loader from "@/components/common/Loader";
import ConfirmModal from "@/components/common/ConfirmModal";
import { toast } from "react-hot-toast";
import { formatNumber } from "@/utils/number-formatter";

export default function ProductionBatchMaterialRequestTab({ batchData, onOpenDrawer }) {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, type: "", request: null });
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await listMaterialRequests({ productionBatchId: batchData?.id });
      const success = res?.success === 1 || res?.settings?.success === 1;
      const data = res?.data || res?.settings?.data;

      if (success && data?.list) {
        setRequests(data.list);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch material requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchData?.id) {
      fetchRequests();
    }
  }, [batchData?.id]);

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleAction = async () => {
    const { type, request } = modalState;
    try {
      let res;
      if (type === "DELIVER") {
        res = await markMaterialRequestDelivered({ id: request.id });
      } else if (type === "CANCEL") {
        res = await cancelMaterialRequest({ id: request.id });
      }

      const success = res?.success === 1 || res?.settings?.success === 1;
      const msg = res?.message || res?.settings?.message;

      if (success) {
        toast.success(msg || "Success");
        await fetchRequests();
        router.refresh();
      } else {
        toast.error(msg || "Something went wrong");
      }
    } catch (err) {
      toast.error("An error occurred while processing action");
    } finally {
      setModalState({ isOpen: false, type: "", request: null });
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Pending") {
      return <span className="bg-orange-500 text-white font-semibold rounded-full px-3 py-1 text-[11px]">Pending</span>;
    }
    if (status === "Delivered") {
      return <span className="bg-green-600 text-white font-semibold rounded-full px-3 py-1 text-[11px]">Delivered</span>;
    }
    if (status === "Cancelled") {
      return <span className="bg-gray-400 text-white font-semibold rounded-full px-3 py-1 text-[11px]">Cancelled</span>;
    }
    return null;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full pb-10">
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Material Requests</h3>
          <p className="mt-1 text-sm text-gray-500">There are no material requests created for this batch yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">

              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <span>{req.code}</span>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(req.status)}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Requested Date</p>
                    <p className="text-sm text-gray-900 font-medium">{formatDateTime(req.requestedDate)}</p>
                  </div>
                  {req.status === "Pending" && (
                    <div className="relative">
                      <div className="flex rounded-md border border-[#1565c0] bg-white overflow-hidden shrink-0">
                        <button
                          type="button"
                          className="px-3 py-1.5 text-xs font-medium text-[#1565c0] hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalState({ isOpen: true, type: "CANCEL", request: req });
                          }}
                        >
                          Cancel Request
                        </button>
                        <button
                          type="button"
                          className="px-2 border-l cursor-pointer border-[#1565c0] text-[#1565c0] hover:bg-blue-50 transition-colors flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId((prev) => (prev === req.id ? null : req.id));
                          }}
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ease-in-out ${
                              openDropdownId === req.id ? "rotate-180" : "rotate-0"
                            }`}
                          />
                        </button>
                      </div>

                      <div
                        className={`absolute top-full right-0 mt-1.5 bg-white border border-[#1565c0] rounded-md shadow-lg z-20 w-40 overflow-hidden transition-all duration-200 ease-out origin-top-right transform ${
                          openDropdownId === req.id
                            ? "opacity-100 scale-100 translate-y-0"
                            : "opacity-0 scale-95 -translate-y-1.5 pointer-events-none"
                        }`}
                      >
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-blue-50/80 hover:text-[#1565c0] transition-colors cursor-pointer whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalState({ isOpen: true, type: "DELIVER", request: req });
                            setOpenDropdownId(null);
                          }}
                        >
                          Mark as Delivered
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{req.items?.length || 0}</p>
                    <p className="text-xs text-gray-500">No. of Item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">
                      {formatNumber(req.requestedQtySum)} <span className="text-sm font-medium">Unit(s)</span>
                    </p>
                    <p className="text-xs text-gray-500">Total Qty</p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={modalState.isOpen}
        title={modalState.type === "DELIVER" ? "Confirm Delivery" : "Cancel Request"}
        message={
          modalState.type === "DELIVER"
            ? `Are you sure you want to mark ${modalState.request?.code} as Delivered? This will permanently credit the requested quantities into the batch stock.`
            : `Are you sure you want to cancel ${modalState.request?.code}?`
        }
        confirmLabel={modalState.type === "DELIVER" ? "Mark Delivered" : "Cancel"}
        variant={modalState.type === "CANCEL" ? "danger" : "primary"}
        onConfirm={handleAction}
        onCancel={() => setModalState({ isOpen: false, type: "", request: null })}
      />
    </div>
  );
}
