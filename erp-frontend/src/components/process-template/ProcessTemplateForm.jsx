"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { listCompanies } from "@/lib/api/company-api";
import { createProcessTemplate, updateProcessTemplate } from "@/lib/api/process-template-api";
import { getProcessTemplateSchema } from "@/lib/validation/process-template.schema";
import { CAPABILITIES } from "@/config/capabilities.config";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import ProcessTemplateStep1 from "./ProcessTemplateStep1";
import ProcessTemplateStep2 from "./ProcessTemplateStep2";
import toast from "react-hot-toast";
import { Check, ChevronRight } from "lucide-react";

const BASE_DEFAULTS = {
  templateName: "",
  templateCode: "",
  executionType: "Flexible",
  companyId: "",
  status: "Active",
  remark: "",
  processes: [],
};

export default function ProcessTemplateForm({
  mode = "create",
  initialData = null,
  id = null,
}) {
  const { can, user } = useAuth();
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyOptions, setCompanyOptions] = useState([]);

  const defaultValues = { ...BASE_DEFAULTS, ...initialData };
  const [formData, setFormData] = useState(defaultValues);
  
  // Ensure processes array items have safe dependency arrays
  const initialProcesses = (initialData?.processes || []).map((p) => ({
    ...p,
    dependencies: Array.isArray(p.dependencies)
      ? p.dependencies
      : typeof p.dependencies === "string"
      ? JSON.parse(p.dependencies || "[]")
      : [],
  }));
  const [processes, setProcesses] = useState(initialProcesses);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null, // "submit" | "discard"
    data: null,
  });

  // Dynamic header setup matching reference image: Master > Process Template | Add New
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
        title: mode === "create" ? "Add New" : "Edit Template",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Process Template", href: "/process-template" },
        ],
        actionButton: null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, mode]);

  // Sync initialData if updated
  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
      const safeProcesses = (initialData.processes || []).map((p) => ({
        ...p,
        dependencies: Array.isArray(p.dependencies)
          ? p.dependencies
          : typeof p.dependencies === "string"
          ? JSON.parse(p.dependencies || "[]")
          : [],
      }));
      setProcesses(safeProcesses);
    }
  }, [initialData]);

  // Load company dropdown for Super Admin
  useEffect(() => {
    if (user?.isSuperAdmin) {
      async function loadCompanies() {
        try {
          const res = await listCompanies({ page: 1, limit: 1000 });
          const list = res?.settings?.data?.list || res?.data?.list || res?.data || [];
          setCompanyOptions(
            list.map((c) => ({ label: c.companyName, value: c.id }))
          );
        } catch (err) {
          console.error("Failed to load companies", err);
        }
      }
      loadCompanies();
    }
  }, [user]);

  // Permission Check
  const requiredPermission =
    mode === "create"
      ? CAPABILITIES.PROCESS_TEMPLATE?.CREATE || "PROCESS_TEMPLATE_CREATE"
      : CAPABILITIES.PROCESS_TEMPLATE?.UPDATE || "PROCESS_TEMPLATE_UPDATE";

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  // Effective companyId
  const effectiveCompanyId = user?.isSuperAdmin
    ? formData.companyId
    : user?.companyId || initialData?.companyId;

  // Validate Step 1 before moving to Step 2
  const handleNextStep = () => {
    const fieldErrors = {};

    if (!formData.templateName?.trim()) {
      fieldErrors.templateName = "⚠ Please enter Template Name.";
    }
    if (!formData.templateCode?.trim()) {
      fieldErrors.templateCode = "⚠ Please enter Template Code.";
    }
    if (!formData.executionType) {
      fieldErrors.executionType = "⚠ Please select Process Execution Type.";
    }
    if (!formData.status) {
      fieldErrors.status = "⚠ Please select Status.";
    }
    if (user?.isSuperAdmin && !effectiveCompanyId) {
      fieldErrors.companyId = "⚠ Please select Company.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const validateFullForm = () => {
    const fullPayload = {
      ...formData,
      companyId: effectiveCompanyId,
      processes,
    };

    const schema = getProcessTemplateSchema(user?.isSuperAdmin);
    const result = schema.safeParse(fullPayload);

    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);

      if (
        fieldErrors.templateName ||
        fieldErrors.templateCode ||
        fieldErrors.companyId ||
        fieldErrors.executionType ||
        fieldErrors.status
      ) {
        setCurrentStep(1);
      } else if (fieldErrors.processes) {
        setCurrentStep(2);
      }
      return false;
    }

    if (!processes || processes.length === 0) {
      setErrors({ processes: "⚠ Please add at least one process." });
      setCurrentStep(2);
      toast.error("Please add at least one process in Step 2.");
      return false;
    }

    for (let i = 0; i < processes.length; i++) {
      if (!processes[i].processId) {
        setErrors({ processes: `⚠ Row #${i + 1} does not have a process selected.` });
        setCurrentStep(2);
        toast.error(`Row #${i + 1} does not have a process selected.`);
        return false;
      }
    }

    setErrors({});
    return true;
  };

  // Trigger Save / Submission Modal
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validateFullForm()) {
      setConfirmState({ isOpen: true, type: "submit", data: null });
    }
  };

  // Handle Discard Click
  const handleDiscard = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      router.push("/process-template");
    }
  };

  // Actual Save API Call
  const handleActualSubmit = async () => {
    try {
      setLoading(true);
      const cleanProcesses = processes.map((p, idx) => ({
        processId: Number(p.processId),
        sequenceNo: idx + 1,
        dependencies: Array.isArray(p.dependencies) && p.dependencies.length > 0 ? p.dependencies.map(Number) : [],
      }));

      const payload = {
        templateName: formData.templateName.trim(),
        templateCode: formData.templateCode.trim(),
        executionType: formData.executionType,
        status: formData.status,
        remark: formData.remark ? formData.remark.trim() : "",
        companyId: Number(effectiveCompanyId),
        processes: cleanProcesses,
        ...(mode === "edit" ? { id: Number(id) } : {}),
      };

      const res = mode === "create"
        ? await createProcessTemplate(payload)
        : await updateProcessTemplate(payload);

      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      let message = res?.message || res?.settings?.message;
      if (Array.isArray(message)) message = message.join(", ");

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "Process Template created successfully!"
            : "Process Template updated successfully!"
        );
        router.push("/process-template");
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} template`);
      }
    } catch (err) {
      console.error("Submit error", err);
      toast.error("An error occurred while saving the process template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto  pb-20  flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-sm bg-[#f8f9fa] p-4 px-10">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 1
                  ? "bg-[#1565c0] text-white shadow-sm"
                  : currentStep > 1
                    ? "bg-[#16a34a] text-white"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > 1 ? <Check size={14} /> : "1"}
            </div>
            <span
              className={`font-semibold ${currentStep === 1 ? "text-gray-900" : "text-gray-600"}`}
            >
              Details
            </span>
          </button>

          <ChevronRight className="text-gray-400" size={16} />

          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) handleNextStep();
            }}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 2
                  ? "bg-[#1565c0] text-white shadow-sm"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <span
              className={`font-semibold ${currentStep === 2 ? "text-gray-900" : "text-gray-500"}`}
            >
              Add Process
            </span>
          </button>
        </div>

        <div className=" rounded-xl    mx-10">
          {currentStep === 1 ? (
            <ProcessTemplateStep1
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              companyOptions={companyOptions}
              user={user}
              mode={mode}
              setIsDirty={setIsDirty}
            />
          ) : (
            <ProcessTemplateStep2
              formData={formData}
              processes={processes}
              setProcesses={setProcesses}
              companyId={effectiveCompanyId}
              errors={errors}
              setErrors={setErrors}
              setIsDirty={setIsDirty}
            />
          )}

          {/* Action Footer Buttons (Matching Reference Images 1 & 2) */}
          <div className="mt-8 pt-6 flex items-center justify-center gap-3">
            {currentStep === 1 ? (
              <>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#1565c0] text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-[#0f57a6] transition cursor-pointer shadow-sm min-w-[100px]"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={loading}
                  className="border border-[#1565c0] text-[#1565c0] px-8 py-2.5 rounded-md text-sm font-medium hover:bg-blue-50 transition cursor-pointer min-w-[100px]"
                >
                  Discard
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="border border-[#1565c0] text-[#1565c0] px-8 py-2.5 rounded-md text-sm font-medium hover:bg-blue-50 transition cursor-pointer min-w-[100px]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-[#1565c0] text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-[#0f57a6] transition cursor-pointer shadow-sm disabled:opacity-50 min-w-[100px]"
                >
                  {loading
                    ? "Saving..."
                    : mode === "create"
                      ? "Save"
                      : "Update"}
                </button>
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={loading}
                  className="border border-[#1565c0] text-[#1565c0] px-8 py-2.5 rounded-md text-sm font-medium hover:bg-blue-50 transition cursor-pointer min-w-[100px]"
                >
                  Discard
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      

      {/* Submission / Discard Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === "submit"
            ? "Confirm Submission"
            : "Discard Changes"
        }
        message={
          confirmState.type === "submit"
            ? "Are you sure you want to save this process template?"
            : "Are you sure you want to discard your changes? Any unsaved data will be lost."
        }
        confirmLabel={confirmState.type === "submit" ? "Save" : "Discard"}
        danger={confirmState.type === "discard"}
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit();
          } else {
            router.push("/process-template");
          }
          setConfirmState({ isOpen: false, type: null, data: null });
        }}
        onCancel={() =>
          setConfirmState({ isOpen: false, type: null, data: null })
        }
      />
    </div>
  );
}
