"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { updateBom } from "@/lib/api/bom-api";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import {
  Layers,
  FileText,
  Download,
  Edit,
  ChevronDown,
  ChevronUp,
  Menu,
  Star,
  Search,
  CheckCircle,
} from "lucide-react";

function DetailRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex justify-between py-1 items-center">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className={`font-semibold text-gray-800 ${valueClassName}`}>
        {value || "-"}
      </span>
    </div>
  );
}

function UserInfoCard({ title, name, date }) {
  const initial = name ? name.charAt(0).toUpperCase() : "B";
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#1565c0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {initial}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900">{name || "—"}</p>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            {date || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BomDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

  const [activeTab, setActiveTab] = useState("summary");
  const [openAccordionStates, setOpenAccordionStates] = useState({});
  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    moduleName: null,
    id: null,
  });

  const handleOpenDrawer = (moduleName, id) => {
    if (!id) return;
    setDrawerState({ isOpen: true, moduleName, id });
  };

  const bomData = data?.settings?.data || data?.data || data;
  const targetId = bomData?.id;

  const {
    id,
    bomName,
    bomCode,
    productionMethod = "Process",
    itemId,
    itemName,
    itemCode,
    itemImageUrl,
    processTemplateId,
    processTemplateName,
    customerId,
    customerName,
    costPerUnitFormatted,
    liveCalculatedCostPerUnit,
    currencySymbol = "₦",
    referenceNumber,
    remarks,
    status = "Active",
    addedByName,
    addedDateFormatted,
    updatedByName,
    updatedDateFormatted,
    items = [],
    processStages = [],
    attachments = [],
    files = [],
  } = bomData || {};

  const isActive = status === "Active" || status === "active";
  const allAttachments = attachments.length > 0 ? attachments : files;

  // Build process steps grouped for the bottom accordion
  const processList =
    processStages.length > 0
      ? processStages
      : (() => {
          const map = new Map();
          (items || []).forEach((item) => {
            const seq = item.sequenceNo || 1;
            if (!map.has(seq)) {
              map.set(seq, {
                sequenceNo: seq,
                processName: item.processName || `Process #${seq}`,
                processCode: item.processCode || "",
                entryItems: [],
                exitItems: [],
              });
            }
            const stage = map.get(seq);
            if (item.materialType === "Exit") {
              stage.exitItems.push(item);
            } else {
              stage.entryItems.push(item);
            }
          });
          return Array.from(map.values());
        })();

  useEffect(() => {
    const initialOpens = {};
    processList.forEach((_, idx) => {
      initialOpens[idx] = true;
    });
    setOpenAccordionStates(initialOpens);
  }, [processList.length]);

  const areAllOpen =
    processList.length > 0 &&
    processList.every((_, idx) => openAccordionStates[idx]);

  const toggleAllAccordions = () => {
    const nextState = !areAllOpen;
    const nextMap = {};
    processList.forEach((_, idx) => {
      nextMap[idx] = nextState;
    });
    setOpenAccordionStates(nextMap);
  };

  const toggleSingleAccordion = (idx) => {
    setOpenAccordionStates((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

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
          { label: "Master", href: "/" },
          { label: "Bill of Materials", href: "/bom" },
        ],
        actionButton:
          targetId && can(CAPABILITIES.BOM?.UPDATE || "BOM_UPDATE")
            ? {
                label: "Edit",
                onClick: () => router.push(`/bom/edit/${targetId}`),
              }
            : null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, router, targetId, can]);

  if (!data || data.success === 0 || data.settings?.success === 0) {
    if (data?.accessDenied) {
      return (
        <AccessDenied
          missingPermission={
            data.requiredPermission || CAPABILITIES.BOM?.VIEW || "BOM_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500">BOM data could not be loaded.</div>
    );
  }

  const handleToggleStatus = async () => {
    try {
      setStatusLoading(true);
      const nextStatus = isActive ? "Inactive" : "Active";
      const res = await updateBom({
        id,
        status: nextStatus,
        bomName,
        itemId,
        processTemplateId,
        productionMethod,
      });
      if (res?.success === 1 || res?.settings?.success === 1) {
        toast.success(`BOM marked as ${nextStatus}`);
        router.refresh();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteBom({ id });
      if (res?.success === 1 || res?.settings?.success === 1) {
        toast.success("BOM deleted successfully");
        router.push("/bom");
      } else {
        toast.error(res?.message || "Failed to delete BOM");
      }
    } catch (err) {
      toast.error("Error deleting BOM");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const formattedCost =
    costPerUnitFormatted ||
    `${currencySymbol} ${(liveCalculatedCostPerUnit || 0).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  console.log(data);
  return (
    <div className="h-full overflow-hidden ">
      <div className="flex gap-8 ps-10 h-full">
        {/* Left Navigation Sidebar (Full Height Fixed) */}
        <div className="w-72 shrink-0 h-full bg-white border-r border-gray-200 p-4 font-sans  justify-between overflow-y-auto shadow-xs">
          <div className="space-y-5">
            {/* Header with Title, Code & Menu */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  {bomName || "BOM Title"}
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {bomCode || "—"}
                </p>
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 p-1 rounded transition"
              >
                <Menu size={18} />
              </button>
            </div>

            {/* Active & Inactive Tabs */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-[#1565c0] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={16} />
                  <span>Summary</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === "audit"
                    ? "bg-[#1565c0] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={16} />
                  <span>Quality Audit</span>
                </div>
              </button>
            </div>
          </div>

          {/* Static Pill Badge Counters anchored at bottom */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <div className="bg-[#f8f9fa] rounded-lg px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-600 font-medium border border-gray-100">
              <div className="flex items-center gap-2.5">
                <FileText size={15} className="text-gray-400" />
                <span>Notes</span>
              </div>
              <span className="bg-gray-200 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                0
              </span>
            </div>

            <div className="bg-[#f8f9fa] rounded-lg px-3.5 py-2.5 flex items-center justify-between text-xs text-gray-600 font-medium border border-gray-100">
              <div className="flex items-center gap-2.5">
                <Layers size={15} className="text-gray-400" />
                <span>Activities</span>
              </div>
              <span className="bg-gray-200 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                0
              </span>
            </div>
          </div>
        </div>

        {/* Right Main Content Area (Independently Scrollable) */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col justify-between pb-16 pe-10">
          <div>
            {/* Top Header Action Bar */}

            {/* Main Content Workspace Layout */}
            <div className="  max-w-[1700px] w-full mx-auto space-y-6">
              {/* Top 3 Summary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Card 1: BOM Summary */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-start gap-3.5">
                    <SharedImageZoom
                      id={`bom-output-${id}`}
                      src={itemImageUrl}
                      alt={itemName || bomName}
                      placeholderText={
                        <Layers size={26} className="text-amber-600" />
                      }
                      thumbnailClassName="w-14 h-14 rounded-full border border-amber-200 shadow-inner"
                      objectFit="cover"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">
                        {bomName}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {bomCode || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-gray-50 pt-1">
                    <div className="flex justify-between py-1 items-center">
                      <span className="text-gray-500 font-medium">
                        Item Name
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer("Item", itemId)}
                        className="text-[#1565c0] font-semibold hover:underline text-right truncate max-w-[170px] cursor-pointer"
                      >
                        {itemName || `Item #${itemId}`}
                      </button>
                    </div>

                    <div className="flex justify-between py-1 items-center">
                      <span className="text-gray-500 font-medium">
                        Process Template
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDrawer("ProcessTemplate", processTemplateId)
                        }
                        className="text-[#1565c0] font-semibold hover:underline text-right truncate max-w-[170px] cursor-pointer"
                      >
                        {processTemplateName ||
                          `Template #${processTemplateId}`}
                      </button>
                    </div>

                    <div className="flex justify-between py-1 items-center">
                      <span className="text-gray-500 font-medium">
                        Production Method
                      </span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {productionMethod}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 items-center">
                      <span className="text-gray-500 font-medium">
                        Reference Code
                      </span>
                      <span className="text-gray-800 font-medium">
                        {referenceNumber || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 items-center">
                      <span className="text-gray-500 font-medium">Status</span>
                      <span
                        className={`font-bold ${isActive ? "text-green-600" : "text-red-600"}`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Production Item Info */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between space-y-3">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Production Item Info
                  </h3>

                  <div className="space-y-2 text-xs divide-y divide-gray-50 pt-1 flex-1">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 font-medium">
                        Print Name
                      </span>
                      <span className="font-semibold text-gray-800 text-right truncate max-w-[170px]">
                        {itemName || "Final Gold Biscuit"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 font-medium">
                        Item Code
                      </span>
                      <span className="font-semibold text-gray-800 font-mono">
                        {itemCode || "FINALGOL001"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 font-medium">
                        Short Name
                      </span>
                      <span className="font-semibold text-gray-800 font-mono">
                        {itemCode || "FINALGOLDBISCUIT"}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 font-medium">Barcode</span>
                      <span className="font-semibold text-gray-800 font-mono">
                        3609121563387
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 font-medium">
                        Cost Per Unit
                      </span>
                      <span className="font-bold text-gray-900">
                        {formattedCost}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-500 font-medium">
                        Primitive Qty
                      </span>
                      <span className="font-semibold text-gray-800">
                        1.00 gms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Attachments */}
                <div className="md:col-span-4 bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Attachments
                  </h3>

                  {allAttachments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                        <Search size={24} />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        No Attachments found.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                      {allAttachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs"
                        >
                          <span className="font-medium text-gray-800 truncate max-w-[170px]">
                            {att.originalFileName ||
                              att.storedFileName ||
                              `Attachment #${idx + 1}`}
                          </span>
                          {att.url && (
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#1565c0] hover:bg-blue-50 p-1 rounded transition"
                            >
                              <Download size={15} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Audit Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Modified Info */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Modified Info
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1565c0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {(updatedByName || addedByName || "Ben Docket")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {updatedByName || addedByName || "Ben Docket"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {updatedDateFormatted ||
                          addedDateFormatted ||
                          "29/06/2026 02:25 PM"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Added Info */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Added Info
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1565c0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {(addedByName || "Ben Docket").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        {addedByName || "Ben Docket"}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {addedDateFormatted || "29/06/2026 01:58 PM"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Accordions: Mapped Process Steps & Materials */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900">
                    {processTemplateName || "Process Template"}
                  </h3>

                  <button
                    type="button"
                    onClick={toggleAllAccordions}
                    className="bg-[#1565c0] hover:bg-[#0f57a6] text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-sm transition cursor-pointer"
                  >
                    {areAllOpen ? "Close All" : "Open All"}
                  </button>
                </div>

                {/* Accordion List */}
                <div className="space-y-3">
                  {processList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 italic">
                      No process steps configured for this BOM.
                    </div>
                  ) : (
                    processList.map((proc, pIdx) => {
                      const isOpen = !!openAccordionStates[pIdx];
                      const isLastStep = pIdx === processList.length - 1;

                      let exitItemsToRender = proc.exitItems || [];
                      if (isLastStep && itemId) {
                        const hasMainItem = exitItemsToRender.some(
                          (ex) => Number(ex.itemId) === Number(itemId),
                        );
                        if (!hasMainItem) {
                          exitItemsToRender = [
                            ...exitItemsToRender,
                            {
                              id: `main-${itemId}`,
                              itemId: Number(itemId),
                              itemName: itemName || `Item #${itemId}`,
                              itemCode: itemCode || "",
                              itemImageUrl: itemImageUrl || null,
                              quantity: 1,
                              isMainOutput: true,
                            },
                          ];
                        }
                      }

                      const procName =
                        proc.processName ||
                        proc.processCode ||
                        `Process #${pIdx + 1}`;
                      const procCode = proc.processCode
                        ? ` (${proc.processCode})`
                        : "";

                      return (
                        <div
                          key={pIdx}
                          className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs"
                        >
                          {/* Accordion Banner Header */}
                          <button
                            type="button"
                            onClick={() => toggleSingleAccordion(pIdx)}
                            className={`w-full px-5 py-3.5 text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                              isOpen
                                ? "bg-[#1565c0] text-white shadow-sm"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                          >
                            <span className="tracking-wide">
                              {procName}
                              {procCode}
                            </span>
                            {isOpen ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>

                          {/* Smooth Animated Grid Wrapper */}
                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              {/* Accordion Body: Side-by-Side Entry & Exit Tables */}
                              <div className="p-5 bg-white grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-t border-gray-200">
                                {/* Left Column: Entry Material */}
                                <div className="lg:col-span-6 space-y-2.5">
                                  <h4 className="text-xs font-bold text-gray-700">
                                    Entry Material
                                  </h4>

                                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                                          <th className="py-2.5 px-3">
                                            Item Image
                                          </th>
                                          <th className="py-2.5 px-3">
                                            Item Name
                                          </th>
                                          <th className="py-2.5 px-3 text-right">
                                            Quantity
                                          </th>
                                          <th className="py-2.5 px-3 text-right">
                                            Total Cost
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 text-xs">
                                        {proc.entryItems.length === 0 ? (
                                          <tr>
                                            <td
                                              colSpan={4}
                                              className="py-4 text-center text-gray-400 italic"
                                            >
                                              No Entry Material found.
                                            </td>
                                          </tr>
                                        ) : (
                                          proc.entryItems.map((eItem, eIdx) => {
                                            const lineCost =
                                              (eItem.costPrice ||
                                                eItem.unitCost ||
                                                0) * (eItem.quantity || 1);

                                            return (
                                              <tr
                                                key={eIdx}
                                                className="hover:bg-gray-50/60 transition"
                                              >
                                                <td className="py-2.5 px-3">
                                                  <SharedImageZoom
                                                    id={`bom-entry-${eItem.id || eIdx}`}
                                                    src={
                                                      eItem.itemImageUrl ||
                                                      eItem.imageUrl
                                                    }
                                                    alt={eItem.itemName}
                                                    placeholderText={
                                                      <Layers
                                                        size={16}
                                                        className="text-gray-400"
                                                      />
                                                    }
                                                    thumbnailClassName="w-9 h-9 rounded-lg border border-gray-200"
                                                    objectFit="cover"
                                                  />
                                                </td>
                                                <td className="py-2.5 px-3 font-semibold text-[#1565c0]">
                                                  <div className="flex items-center gap-1.5">
                                                    {eItem.isPrimary ===
                                                      "Yes" && (
                                                      <Star
                                                        size={13}
                                                        className="text-amber-500 fill-amber-500 shrink-0"
                                                      />
                                                    )}
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleOpenDrawer(
                                                          "Item",
                                                          eItem.itemId,
                                                        )
                                                      }
                                                      className="hover:underline text-left cursor-pointer"
                                                    >
                                                      {eItem.itemName ||
                                                        `Item #${eItem.itemId}`}
                                                    </button>
                                                  </div>
                                                  <p className="text-[10px] text-gray-400 font-mono font-normal">
                                                    {eItem.itemCode
                                                      ? `(${eItem.itemCode})`
                                                      : ""}
                                                  </p>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium text-gray-800">
                                                  {eItem.quantity} gms
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                                                  {eItem.isInternalTransfer ? (
                                                    <span className="text-gray-400 font-normal">
                                                      -
                                                    </span>
                                                  ) : (
                                                    <>
                                                      {currencySymbol}{" "}
                                                      {lineCost.toLocaleString(
                                                        undefined,
                                                        {
                                                          minimumFractionDigits: 2,
                                                          maximumFractionDigits: 2,
                                                        },
                                                      )}
                                                    </>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Right Column: Exit Material */}
                                <div className="lg:col-span-6 space-y-2.5">
                                  <h4 className="text-xs font-bold text-gray-700">
                                    Exit Material
                                  </h4>

                                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                                          <th className="py-2.5 px-3">
                                            Item Image
                                          </th>
                                          <th className="py-2.5 px-3">
                                            Item Name
                                          </th>
                                          <th className="py-2.5 px-3 text-right">
                                            Quantity
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 text-xs">
                                        {exitItemsToRender.length === 0 ? (
                                          <tr>
                                            <td
                                              colSpan={3}
                                              className="py-4 text-center text-gray-400 italic"
                                            >
                                              No Exit Material found.
                                            </td>
                                          </tr>
                                        ) : (
                                          exitItemsToRender.map(
                                            (exItem, exIdx) => (
                                              <tr
                                                key={exIdx}
                                                className="hover:bg-gray-50/60 transition"
                                              >
                                                <td className="py-2.5 px-3">
                                                  <SharedImageZoom
                                                    id={`bom-exit-${exItem.id || exIdx}`}
                                                    src={
                                                      exItem.itemImageUrl ||
                                                      exItem.imageUrl
                                                    }
                                                    alt={exItem.itemName}
                                                    placeholderText={
                                                      <Layers
                                                        size={16}
                                                        className="text-gray-400"
                                                      />
                                                    }
                                                    thumbnailClassName="w-9 h-9 rounded-lg border border-gray-200"
                                                    objectFit="cover"
                                                  />
                                                </td>
                                                <td className="py-2.5 px-3 font-semibold text-[#1565c0]">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleOpenDrawer(
                                                        "Item",
                                                        exItem.itemId,
                                                      )
                                                    }
                                                    className="hover:underline text-left cursor-pointer"
                                                  >
                                                    {exItem.itemName ||
                                                      `Item #${exItem.itemId}`}
                                                  </button>
                                                  <p className="text-[10px] text-gray-400 font-mono font-normal">
                                                    {exItem.itemCode
                                                      ? `(${exItem.itemCode})`
                                                      : ""}
                                                  </p>
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-medium text-gray-800">
                                                  {exItem.quantity} gms
                                                </td>
                                              </tr>
                                            ),
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Dynamic Unified SideDrawer for Item, Customer, and ProcessTemplate */}
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
