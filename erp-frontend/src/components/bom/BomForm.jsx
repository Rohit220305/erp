"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHeader } from "@/context/HeaderContext";
import { listCompanies, getCompany } from "@/lib/api/company-api";
import { listCustomerCompanies } from "@/lib/api/customer-company-api";
import { listItems } from "@/lib/api/item-api";
import { listProcessTemplates, getProcessTemplate } from "@/lib/api/process-template-api";
import { createBom, updateBom } from "@/lib/api/bom-api";
import { getBomSchema } from "@/lib/validation/bom.schema";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import AccessDenied from "@/components/common/AccessDenied";
import ConfirmModal from "@/components/common/ConfirmModal";
import BomStep1Details from "./BomStep1Details";
import BomStep2ProcessMapping from "./BomStep2ProcessMapping";
import toast from "react-hot-toast";
import { Check, ChevronRight } from "lucide-react";

const BASE_DEFAULTS = {
  bomName: "",
  bomCode: "",
  productionMethod: "process",
  itemId: "",
  processTemplateId: "",
  customerId: null,
  referenceNumber: "",
  remarks: "",
  companyId: "",
  status: "Active",
};

export default function BomForm({
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
  const [itemOptions, setItemOptions] = useState([]);
  const [rawItemOptions, setRawItemOptions] = useState([]);
  const [processTemplateOptions, setProcessTemplateOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("$");

  const [formData, setFormData] = useState({ ...BASE_DEFAULTS, ...initialData });
  const [newFiles, setNewFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(initialData?.attachments || initialData?.files || []);
  const [templateProcesses, setTemplateProcesses] = useState([]);
  const [processItems, setProcessItems] = useState(initialData?.items || []);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    type: null,
    data: null,
  });

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
        title: mode === "create" ? "Add" : "Edit",
        breadcrumbs: [
          { label: "Production" },
          { label: "Bill of Materials", href: "/bom" },
        ],
        actionButton: null,
      },
    });
    return () => resetConfig();
  }, [setConfig, resetConfig, mode]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...BASE_DEFAULTS, ...initialData });
      setExistingFiles(initialData.attachments || initialData.files || []);
      setProcessItems(initialData.items || []);
    }
  }, [initialData]);

  useEffect(() => {
    async function loadGlobalData() {
      try {
        const itemRes = await listItems({ page: 1, limit: 1000 });
        const itemList = itemRes?.settings?.data?.list || itemRes?.data?.list || itemRes?.data || [];
        
        const inHouseItems = itemList.filter(i => i.isInHouseProduction === "Yes");
        setItemOptions(
          inHouseItems.map((i) => ({ label: i.itemName, value: i.id }))
        );
        setRawItemOptions(itemList.map((i) => ({ ...i, label: i.itemName, value: i.id })));

        const ptRes = await listProcessTemplates({ page: 1, limit: 1000 });
        const ptList = ptRes?.settings?.data?.list || ptRes?.data?.list || ptRes?.data || [];
        setProcessTemplateOptions(
          ptList.map((pt) => ({ label: pt.templateName, value: pt.id }))
        );

        const custRes = await listCustomerCompanies({ page: 1, limit: 1000 });
        const custList = custRes?.settings?.data?.list || custRes?.data?.list || custRes?.data || [];
        setCustomerOptions(
          custList.map((c) => ({ label: c.name || c.customerName, value: c.id }))
        );
      } catch (err) {
        console.error("Failed to load select options", err);
      }
    }
    loadGlobalData();

    if (user?.isSuperAdmin) {
      async function loadCompanies() {
        try {
          const compRes = await listCompanies({ page: 1, limit: 1000 });
          const list = compRes?.settings?.data?.list || compRes?.data?.list || compRes?.data || [];
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

  const effectiveCompanyId = user?.isSuperAdmin
    ? formData.companyId
    : user?.companyId || initialData?.companyId;

  useEffect(() => {
    if (effectiveCompanyId) {
      getCompany(effectiveCompanyId)
        .then((res) => {
          const comp = res?.settings?.data || res?.data || res;
          if (comp?.currencySymbol) {
            setCurrencySymbol(comp.currencySymbol);
          }
        })
        .catch(() => null);
    }
  }, [effectiveCompanyId]);

  useEffect(() => {
    if (formData.processTemplateId) {
      getProcessTemplate({ id: formData.processTemplateId })
        .then((res) => {
          const pt = res?.settings?.data || res?.data || res;
          if (pt && pt.processes) {
            setTemplateProcesses(pt.processes);
          }
        })
        .catch((err) => console.error("Failed to fetch process template details", err));
    }
  }, [formData.processTemplateId]);

  const requiredPermission =
    mode === "create"
      ? CAPABILITIES.BOM?.CREATE || "BOM_CREATE"
      : CAPABILITIES.BOM?.UPDATE || "BOM_UPDATE";

  if (!can(requiredPermission)) {
    return <AccessDenied missingPermission={requiredPermission} />;
  }

  const handleNextStep = () => {
    const fieldErrors = {};

    if (!formData.bomName?.trim()) {
      fieldErrors.bomName = "Please enter BOM Name.";
    }
    if (!formData.productionMethod) {
      fieldErrors.productionMethod = "Please select Production Method.";
    }
    if (!formData.itemId) {
      fieldErrors.itemId = "Please select Item.";
    }
    if (!formData.processTemplateId) {
      fieldErrors.processTemplateId = "Please select Process Template.";
    }
    if (!formData.status) {
      fieldErrors.status = "Please select Status.";
    }
    if (user?.isSuperAdmin && !effectiveCompanyId) {
      fieldErrors.companyId = "Please select Company.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  const validateFullForm = () => {
    const validItems = (processItems || []).filter((i) => i.itemId && Number(i.itemId) > 0);

    if (validItems.length === 0) {
      setErrors({ items: "Please select material item for at least one row in Step 2." });
      setCurrentStep(2);
      toast.error("Please select material item for at least one row in Step 2.");
      return false;
    }

    const fullPayload = {
      ...formData,
      companyId: effectiveCompanyId,
      items: validItems,
    };

    const schema = getBomSchema(user?.isSuperAdmin);
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
        fieldErrors.bomName ||
        fieldErrors.productionMethod ||
        fieldErrors.itemId ||
        fieldErrors.processTemplateId ||
        fieldErrors.companyId ||
        fieldErrors.status
      ) {
        setCurrentStep(1);
        toast.error("Please check the form errors in Step 1.");
      } else if (fieldErrors.items) {
        setCurrentStep(2);
        toast.error(typeof fieldErrors.items === "string" ? fieldErrors.items : "Please check material item mappings in Step 2.");
      } else {
        const firstMsg = Object.values(fieldErrors)[0];
        toast.error(firstMsg || "Please fix validation errors.");
      }
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validateFullForm()) {
      setConfirmState({ isOpen: true, type: "submit", data: null });
    }
  };

  const navigateOnDiscard = () => {
    const targetId = initialData?.id || id;
    if (mode === "edit" && targetId) {
      router.push(buildRoute("bom", "detail", { id: targetId }));
    } else {
      router.push(buildRoute("bom", "list"));
    }
  };

  const handleDiscard = () => {
    if (isDirty) {
      setConfirmState({ isOpen: true, type: "discard", data: null });
    } else {
      navigateOnDiscard();
    }
  };

  const handleActualSubmit = async () => {
    try {
      setLoading(true);

      const validItems = (processItems || []).filter((i) => i.itemId && Number(i.itemId) > 0);

      const payloadObj = {
        bomName: formData.bomName.trim(),
        ...(formData.bomCode?.trim() ? { bomCode: formData.bomCode.trim() } : {}),
        productionMethod: formData.productionMethod,
        itemId: Number(formData.itemId),
        processTemplateId: Number(formData.processTemplateId),
        customerId: formData.customerId ? Number(formData.customerId) : null,
        referenceNumber: formData.referenceNumber ? formData.referenceNumber.trim() : "",
        remarks: formData.remarks ? formData.remarks.trim() : "",
        status: formData.status,
        companyId: Number(effectiveCompanyId),
        items: validItems.map((item) => ({
          ...(item.id ? { id: Number(item.id) } : {}),
          processTemplateMappingId: Number(item.processTemplateMappingId),
          materialType: item.materialType === "Exit" ? "Exit" : "Entry",
          itemId: Number(item.itemId),
          quantity: Number(item.quantity || 1),
          isInternalTransfer: !!item.isInternalTransfer,
          isPrimary: item.isPrimary || "No",
        })),
        ...(mode === "edit" ? { id: Number(id || initialData?.id) } : {}),
      };

      const fd = new FormData();
      Object.keys(payloadObj).forEach((key) => {
        if (key === "items") {
          fd.append("items", JSON.stringify(payloadObj.items));
        } else if (payloadObj[key] !== null && payloadObj[key] !== undefined) {
          fd.append(key, String(payloadObj[key]));
        }
      });

      if (mode === "edit") {
        fd.append("retainedAttachments", JSON.stringify(existingFiles));
      }

      newFiles.forEach((file) => {
        fd.append("attachments", file);
      });

      const res = mode === "create"
        ? await createBom(fd)
        : await updateBom(fd);

      const isSuccess = res?.success === 1 || res?.settings?.success === 1;
      let message = res?.message || res?.settings?.message;
      if (Array.isArray(message)) message = message.join(", ");

      if (isSuccess) {
        toast.success(
          mode === "create"
            ? "BOM created successfully!"
            : "BOM updated successfully!"
        );
        router.refresh();
        router.push(buildRoute("bom", "list"));
      } else {
        toast.error(message || `Failed to ${mode === "create" ? "create" : "update"} BOM`);
      }
    } catch (err) {
      console.error("BOM submit error", err);
      toast.error("An error occurred while saving the BOM.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center gap-4 text-sm bg-[#f8f9fa] p-4 px-10 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${currentStep === 1
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
              Details & Attachments
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
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${currentStep === 2
                ? "bg-[#1565c0] text-white shadow-sm"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              2
            </div>
            <span
              className={`font-semibold ${currentStep === 2 ? "text-gray-900" : "text-gray-500"}`}
            >
              Process & Material Mapping
            </span>
          </button>
        </div>

        <div className="rounded-xl mx-6 md:mx-10">
          {currentStep === 1 ? (
            <BomStep1Details
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
              companyOptions={companyOptions}
              itemOptions={itemOptions}
              processTemplateOptions={processTemplateOptions}
              customerOptions={customerOptions}
              newFiles={newFiles}
              setNewFiles={setNewFiles}
              existingFiles={existingFiles}
              setExistingFiles={setExistingFiles}
              user={user}
              mode={mode}
              setIsDirty={setIsDirty}
            />
          ) : (
            <BomStep2ProcessMapping
              formData={formData}
              processItems={processItems}
              setProcessItems={setProcessItems}
              templateProcesses={templateProcesses}
              rawItemOptions={rawItemOptions}
              processTemplateOptions={processTemplateOptions}
              currencySymbol={currencySymbol}
              errors={errors}
              setErrors={setErrors}
              setIsDirty={setIsDirty}
            />
          )}

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
                {mode === "edit" && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#1565c0] text-white px-8 py-2.5 rounded-md text-sm font-medium hover:bg-[#0f57a6] transition cursor-pointer shadow-sm disabled:opacity-50 min-w-[100px]"
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                )}
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

      <ConfirmModal
        isOpen={confirmState.isOpen}
        actionType={
          confirmState.type === "submit"
            ? mode === "create"
              ? "create"
              : "update"
            : "discard"
        }
        entityName="Bill of Materials"
        onConfirm={() => {
          if (confirmState.type === "submit") {
            handleActualSubmit();
          } else {
            navigateOnDiscard();
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
