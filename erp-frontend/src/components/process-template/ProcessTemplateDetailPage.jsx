"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { updateProcessTemplate } from "@/lib/api/process-template-api";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import { GitBranch, Workflow, FileText, CheckCircle2, ArrowRight } from "lucide-react";

import dynamic from "next/dynamic";
import Loader from "@/components/common/Loader";

const ProcessFlowchartContainer = dynamic(
  () => import("./flowchart/ProcessFlowchartContainer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-white rounded-xl border border-gray-100">
        <Loader />
      </div>
    ),
  }
);

function DetailRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-right ${valueClassName}`}>
        {value || "-"}
      </span>
    </div>
  );
}

function UserInfoCard({ title, name, date }) {
  const initial = name ? name.charAt(0).toUpperCase() : "S";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#1565c0]">
            {name}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {date || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProcessTemplateDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState("summary"); // "summary" | "flowchart"
  const [drawerState, setDrawerState] = useState({ isOpen: false, processId: null });

  const initialProcesses = data?.processes || [];
  const [currentProcesses, setCurrentProcesses] = useState(initialProcesses);
  const [isSavingFlowchart, setIsSavingFlowchart] = useState(false);

  const [prevProcesses, setPrevProcesses] = useState(data?.processes);
  if (data?.processes !== prevProcesses) {
    setPrevProcesses(data?.processes);
    setCurrentProcesses(data?.processes || []);
  }

  const handleOpenProcessDrawer = (processId) => {
    if (!processId) return;
    setDrawerState({ isOpen: true, processId: Number(processId) });
  };

  const handleSaveFlowchart = async (updatedProcesses) => {
    if (!data?.id) return;
    setIsSavingFlowchart(true);
    try {
      const targetProcesses = updatedProcesses || currentProcesses;
      const payload = {
        id: Number(data.id),
        templateName: data.templateName,
        templateCode: data.templateCode,
        executionType: data.executionType || "Flexible",
        remark: data.remark || "",
        status: data.status || "Active",
        processes: targetProcesses.map((p) => {
          const item = {
            processId: Number(p.processId),
            sequenceNo: Number(p.sequenceNo),
            dependencies: (p.dependencies || []).map(Number),
          };
          if (p.nodePosition) item.nodePosition = p.nodePosition;
          if (p.handleConfig) item.handleConfig = p.handleConfig;
          return item;
        }),
      };

      const res = await updateProcessTemplate(payload);
      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      if (isSuccess) {
        toast.success("Process flowchart layout and dependencies saved successfully!");
        setCurrentProcesses(targetProcesses);
      } else {
        const errorMsg = res?.settings?.message || res?.message || "Failed to save flowchart changes.";
        toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to save flowchart changes.");
    } finally {
      setIsSavingFlowchart(false);
    }
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
        title: "Process Template Details",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Process Template", href: "/process-template" },
        ],
        actionButton:
          can(CAPABILITIES.PROCESS_TEMPLATE?.UPDATE || "PROCESS_TEMPLATE_UPDATE") && !data?.isTemplateInUse
            ? {
              label: "Edit",
              onClick: () => router.push(`/process-template/edit/${data?.id}`),
            }
            : null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, router, data?.id, data?.isTemplateInUse, can]);

  if (!data || data.success === 0 || data.settings?.success === 0) {
    if (data?.accessDenied) {
      return (
        <AccessDenied
          missingPermission={
            data.requiredPermission || CAPABILITIES.PROCESS_TEMPLATE?.VIEW || "PROCESS_TEMPLATE_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500">Process Template data could not be loaded.</div>
    );
  }

  const {
    id,
    templateName,
    templateCode,
    executionType,
    remark,
    status,
    companyName,
    addedByName,
    addedDateFormatted,
    updatedByName,
    updatedDateFormatted,
    isTemplateInUse = false,
    processes = [],
  } = data;

  const isActive = status === "Active" || status === "active";

  const processIdMap = new Map();
  currentProcesses.forEach((p) => {
    processIdMap.set(Number(p.processId), p.processName || `Process #${p.processId}`);
  });

  return (
    <div className="h-full p-6 px-10 overflow-hidden">
      <div className="grid grid-cols-12 gap-6 h-full items-start">
        <div className="col-span-2 h-full">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5 border border-gray-100 space-y-4 h-full">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1565c0] flex items-center justify-center mb-3">
                <GitBranch size={24} />
              </div>
              <h2 className="font-semibold text-base text-gray-900 leading-tight">
                {templateName}
              </h2>
              <p className="text-gray-400 text-xs font-mono mt-1 uppercase">
                {templateCode}
              </p>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={`w-full text-left py-2.5 px-4 rounded-lg text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-[#1565c0] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={18} />
                  <span>Summary</span>
                </div>
                {activeTab === "summary" && <CheckCircle2 size={16} />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("flowchart")}
                className={`w-full text-left py-2.5 px-4 rounded-lg text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                  activeTab === "flowchart"
                    ? "bg-[#1565c0] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Workflow size={18} />
                  <span>Process Flowchart</span>
                </div>
                {activeTab === "flowchart" && <CheckCircle2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-10 h-full overflow-y-auto pr-2 pb-6">
          {activeTab === "summary" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">
                    Template Overview
                  </h3>

                  <div className="space-y-1">
                    <DetailRow label="Template Name" value={templateName} />
                    <DetailRow label="Template Code" value={templateCode} />
                    <DetailRow
                      label="Execution Type"
                      value={executionType || "Sequential"}
                    />
                    <DetailRow
                      label="Status"
                      value={status}
                      valueClassName={
                        isActive
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    />
                  </div>
                </div>

                <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100 flex flex-col">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">
                    Remark / Description
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap flex-1">
                    {remark || (
                      <span className="text-gray-400 italic">
                        No remark provided for this template.
                      </span>
                    )}
                  </div>
                </div>

                <div className="xl:col-span-1 flex flex-col gap-4">
                  <UserInfoCard
                    title="Added Info"
                    name={addedByName}
                    date={addedDateFormatted}
                  />
                  {updatedByName && (
                    <UserInfoCard
                      title="Modified Info"
                      name={updatedByName}
                      date={updatedDateFormatted}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Process Sequence Grid ({currentProcesses.length} Processes)
                  </h3>
                  <span className="text-xs text-gray-400 font-mono">
                    Execution Mode: {executionType || "Sequential"}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full table-fixed text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="py-3 px-4 w-40 text-center">Seq #</th>
                        <th className="py-3 px-4 w-1/2 text-center">
                          Process Name
                        </th>
                        <th className="py-3 px-4 w-1/2">Dependencies</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {currentProcesses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-8 text-center text-gray-400 italic"
                          >
                            No process sequence steps defined.
                          </td>
                        </tr>
                      ) : (
                        currentProcesses.map((proc, idx) => {
                          const depItems = (proc.dependencies || [])
                            .map((depId) => ({
                              id: Number(depId),
                              name:
                                processIdMap.get(Number(depId)) ||
                                `Process #${depId}`,
                            }))
                            .filter((item) => item.name);

                          return (
                            <tr
                              key={idx}
                              className="hover:bg-blue-50/20 transition-colors"
                            >
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-[#1565c0] text-xs font-bold border border-blue-100">
                                  {proc.sequenceNo || idx + 1}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-medium text-gray-900 truncate text-center">
                                {proc.processId ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenProcessDrawer(proc.processId)
                                    }
                                    className="text-[#1565c0] hover:underline font-semibold cursor-pointer transition"
                                  >
                                    {proc.processName || "—"}
                                  </button>
                                ) : (
                                  <span>{proc.processName || "—"}</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {depItems.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {depItems.map((dep, dIdx) => (
                                      <button
                                        key={dIdx}
                                        type="button"
                                        onClick={() =>
                                          handleOpenProcessDrawer(dep.id)
                                        }
                                        className="text-center inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-md font-medium bg-[#1565c0] text-white border border-blue-100 hover:bg-[#0f57a6] cursor-pointer transition"
                                      >
                                        {dep.name}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs italic">
                                    —
                                  </span>
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
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Process Flow Chart
                    </h3>
                    
                  </div>
                </div>
              </div>

              <ProcessFlowchartContainer
                processes={currentProcesses}
                onOpenProcessDrawer={handleOpenProcessDrawer}
                onProcessesChange={setCurrentProcesses}
                onSaveFlowchart={handleSaveFlowchart}
                isSaving={isSavingFlowchart}
              />
            </div>
          )}
        </div>
      </div>

      <SideDrawer
        open={drawerState.isOpen}
        onClose={() => setDrawerState({ isOpen: false, processId: null })}
        moduleName="Process"
        mode="details"
        data={drawerState.processId ? { id: drawerState.processId } : null}
      />
    </div>
  );
}
