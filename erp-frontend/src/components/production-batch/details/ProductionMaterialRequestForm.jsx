"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { createMaterialRequest } from "@/lib/api/material-request-api";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import AccessDenied from "@/components/common/AccessDenied";
import ModuleLink from "@/components/common/ModuleLink";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import SideDrawer from "@/components/common/SideDrawer";

export default function ProductionMaterialRequestForm({
  batchData,
  initialSuggestions = [],
}) {

  console.log("batchData in ProductionMaterialRequestForm:", batchData);
  console.log("initialSuggestions in ProductionMaterialRequestForm:", initialSuggestions);

  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

  const [remark, setRemark] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sideDrawerState, setSideDrawerState] = useState({ isOpen: false, moduleName: null, id: null });

  useEffect(() => {
    const code = batchData?.batchCode || "Details";
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
        title: "Request Material",
        breadcrumbs: [
          { label: "Master", href: buildRoute("home", "list") },
          { label: "Production Batches", href: buildRoute("production-batch", "list") },
          {
            label: code,
            href:  buildRoute("production-batch", "detail", { id: batchData.id }),
          },
        ],
        actionButton: null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, batchData]);

  useEffect(() => {
    if (initialSuggestions && initialSuggestions.length > 0) {
      const formatted = initialSuggestions.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName || "",
        itemCode: item.itemCode || "",
        itemImageUrl: item.itemImageUrl || "",
        uomName: item.uomName || "gms",
        availableQty: Number(item.availableStock || 0),
        suggestedQty: Number(item.suggestedQty !== undefined ? item.suggestedQty : (item.requiredQty - item.availableStock)),
        requestedQty: Number(item.suggestedQty !== undefined ? item.suggestedQty : Math.max(0, item.requiredQty - item.availableStock)),
      }));
      setItems(formatted);
    }
  }, [initialSuggestions]);

  if (batchData?.accessDenied) {
    return <AccessDenied missingPermission={batchData.requiredPermission || CAPABILITIES.MATERIAL_REQUEST?.CREATE} />;
  }

  const handleOpenDrawer = (moduleName, id) => {
    if (moduleName && id) {
      setSideDrawerState({ isOpen: true, moduleName, id });
    }
  };

  const handleQuantityChange = (itemId, val) => {
    setItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, requestedQty: val } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setAttachments((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("Please add at least one item to the Material Request.");
      return;
    }

    const payloadItems = items
      .map((item) => ({
        itemId: item.itemId,
        requestedQty: Number(item.requestedQty) || 0,
      }))
      .filter((i) => i.requestedQty > 0);

    if (payloadItems.length === 0) {
      setErrorMsg("At least one item must have a requested quantity greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productionBatchId", String(batchData.id));
      if (remark) formData.append("remark", remark);
      formData.append("items", JSON.stringify(payloadItems));

      if (attachments && attachments.length > 0) {
        attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      const res = await createMaterialRequest(formData);
      const success = res?.success === 1 || res?.settings?.success === 1;

      if (success) {
        router.push(buildRoute("production-batch", "detail", { id: batchData.id }));
      } else {
        setErrorMsg(res?.message || res?.settings?.message || "Failed to create Material Request.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (batchData?.id) {
      router.push(buildRoute("production-batch", "detail", { id: batchData.id }));
    } else {
      router.back();
    }
  };

  const formatDecimal = (num) => {
    const val = Number(num || 0);
    return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="px-10  py-4 h-full overflow-y-scroll">
      {/* Header Info Card matching Screenshot 1 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h2 className="text-[18px] font-bold text-gray-900 font-mono tracking-tight">
          {batchData?.batchCode || "HPR/----/--/-----"}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
          <div>
            <p className="text-[12px] font-medium text-gray-400">Item Name</p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.productName || batchData?.itemName || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-400">Bill of Material</p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.bomName || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-400">Process Template Name</p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.processTemplateName || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-400">Plant Name</p>
            <p className="text-[14px] font-semibold text-[#1565c0] mt-0.5">
              {batchData?.plantName || batchData?.companyName || "Baner Plant"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Form Card matching Screenshot 1 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
        <h3 className="text-[16px] font-bold text-gray-900 pb-2 border-b border-gray-100">
          Item Details
        </h3>

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Remark & Attachments Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Remark :</label>
            <textarea
              rows={4}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter remarks or special instructions..."
              className="w-full rounded-lg border border-gray-300 p-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1565c0]/20 focus:border-[#1565c0] resize-none bg-gray-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-700">Attachments :</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-[#1565c0] transition-colors cursor-pointer bg-gray-50/30 relative min-h-[110px]"
            >
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload size={24} className="text-gray-400 mb-1" />
              <p className="text-[13px] font-medium text-gray-600">Drop files here or click to browse</p>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {attachments.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#1565c0] text-[12px] font-medium border border-blue-200"
                  >
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Item Suggestions Table matching Screenshot 1 */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 min-w-[200px]">Item Name</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4 text-right">Available Unit(s)</th>
                <th className="py-3 px-4 text-right">Suggested Qty</th>
                <th className="py-3 px-4 text-center w-48">Required Qty *</th>
                <th className="py-3 px-4 text-right">Required Unit(s)</th>
                <th className="py-3 px-4 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No items available for material request.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.itemId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <SharedImageZoom
                          id={`mr-item-${item.itemId}`}
                          src={item.itemImageUrl}
                          alt={item.itemName}
                          placeholderText={<Package size={18} />}
                          thumbnailClassName="w-9 h-9 rounded-lg border border-gray-200 shrink-0 object-cover"
                        />
                        <div>
                          <ModuleLink
                            moduleName="Item"
                            id={item.itemId}
                            className="font-semibold text-[#1565c0] hover:underline"
                            onOpenDrawer={handleOpenDrawer}
                          >
                            {item.itemName}
                          </ModuleLink>
                          <p className="text-[11px] text-gray-400 font-mono">
                            ({item.itemCode || "N/A"})
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                      {formatDecimal(item.availableQty)} {item.uomName}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                      {formatDecimal(item.availableQty)} Unit(s)
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                      {formatDecimal(item.suggestedQty)} {item.uomName}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#1565c0]/20 focus-within:border-[#1565c0]">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.requestedQty}
                          onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                          className="w-full py-1.5 px-3 text-right font-mono text-[14px] font-semibold text-gray-900 focus:outline-none"
                        />
                        <span className="bg-gray-100 text-gray-500 px-3 py-1.5 text-[12px] font-medium border-l border-gray-200 shrink-0">
                          {item.uomName}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-gray-800">
                      {formatDecimal(item.requestedQty)} Unit(s)
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.itemId)}
                        title="Remove Item"
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Form Bottom Action Buttons matching Screenshot 1 */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || items.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[#1565c0] hover:bg-[#0d47a1] text-white text-[14px] font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Request Material"}
          </button>

          <button
            type="button"
            onClick={handleDiscard}
            className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-[14px] font-semibold transition-colors cursor-pointer"
          >
            Discard
          </button>
        </div>
      </form>

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
