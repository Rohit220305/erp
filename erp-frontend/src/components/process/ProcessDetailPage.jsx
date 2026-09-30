"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import AccessDenied from "@/components/common/AccessDenied";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import SideDrawer from "@/components/common/SideDrawer";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { Tag, FileText, ExternalLink } from "lucide-react";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

function DetailRow({ label, value, valueClassName = "", valueNode }) {
  if (!value && !valueNode) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {valueNode ? (
        valueNode
      ) : (
        <span className={`text-sm font-medium text-right ${valueClassName}`}>
          {displayFormat(value)}
        </span>
      )}
    </div>
  );
}

function UserInfoCard({ title, name, date, userId, onOpenUser }) {
  const initial = name ? name.charAt(0).toUpperCase() : "S";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          {userId ? (
            <ModuleLink
              href={buildRoute("user", "detail", { id: userId })}
              onClick={onOpenUser}
              className="text-sm font-semibold text-[#1565c0] hover:underline cursor-pointer"
            >
              {name || "System"}
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

export default function ProcessDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can, user } = useAuth();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] =
    useState(null);
  const [selectedWorkCentreForDetails, setSelectedWorkCentreForDetails] =
    useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

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
          { label:  "Master" },
          { label: "Process Master", href: buildRoute("process", "list") },
        ],
        actionButton: can(CAPABILITIES.PROCESS?.UPDATE || "PROCESS_UPDATE")
          ? {
              label: "Edit",
              onClick: () => setIsEditDrawerOpen(true),
            }
          : null,
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, router, data?.id, data?.processName, resetConfig, can]);

  if (!data || data.success === 0 || data.settings?.success === 0) {
    if (data?.accessDenied) {
      return (
        <AccessDenied
          missingPermission={
            data.requiredPermission || CAPABILITIES.PROCESS?.VIEW || "PROCESS_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500">Process data could not be loaded.</div>
    );
  }

  const {
    id,
    processName,
    processCode,
    description,
    status,
    imageUrl,
    instructionPdfUrl,
    workCentreId,
    workCentreName,
    companyId,
    companyName,
    addedBy,
    addedByName,
    addedDateFormatted,
    updatedBy,
    updatedByName,
    updatedDateFormatted,
  } = data;

  const isActive = status === "Active" || status === "active";
  const hasAddedInfo = Boolean(addedByName || addedDateFormatted || addedBy);
  const hasUpdatedInfo = Boolean(
    updatedByName || updatedDateFormatted || updatedBy,
  );

  return (
    <div className="p-6  min-h-full px-10 overflow-y-scroll">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5 border border-gray-100">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900">
                {displayFormat(processName)}
              </h2>
              {processCode && (
                <p className="text-gray-400 text-sm mt-0.5 font-mono uppercase">
                  {displayFormat(processCode)}
                </p>
              )}
            </div>

            <hr className="my-4 border-gray-100" />

            <button className="w-full bg-[#1565c0] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6] cursor-pointer">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10 h-full">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">
                Details
              </h3>

              <div className="flex items-center gap-4 mb-8">
                <SharedImageZoom
                  id={`detail-process-${id}`}
                  src={imageUrl}
                  alt={processName}
                  placeholderText={<Tag size={24} className="text-[#1565c0]" />}
                  thumbnailClassName="w-16 h-16 rounded-full object-cover border-4 border-blue-50 shadow-sm shrink-0 bg-gray-50 flex items-center justify-center"
                  modalImageClassName="w-72 h-72 rounded-full shadow-2xl"
                />
                <div className="flex flex-col">
                  <h2 className="font-semibold text-base text-gray-900">
                    {displayFormat(processName)}
                  </h2>
                  {processCode && (
                    <span className="text-xs text-gray-400 font-mono uppercase mt-0.5">
                      {displayFormat(processCode)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Process Code" value={processCode} />
                {user?.isSuperAdmin && companyName && (
                  <DetailRow
                    label="Company"
                    value={
                      <ModuleLink
                        href={buildRoute("company", "detail", {
                          id: companyId,
                        })}
                        onClick={() =>
                          setSelectedCompanyForDetails({ companyId })
                        }
                        className="text-[#1565c0] font-medium hover:underline cursor-pointer"
                      >
                        {companyName}
                      </ModuleLink>
                    }
                  />
                )}
                {workCentreName && (
                  <DetailRow
                    label="Work Centre"
                    value={
                      <ModuleLink
                        href={buildRoute("work-centre", "detail", {
                          id: workCentreId,
                        })}
                        onClick={() =>
                          setSelectedWorkCentreForDetails({ workCentreId })
                        }
                        className="text-[#1565c0] font-medium hover:underline cursor-pointer"
                      >
                        {workCentreName}
                      </ModuleLink>
                    }
                  />
                )}
                <DetailRow
                  label="Status"
                  valueNode={<StatusBadge status={status} />}
                />
              </div>
            </div>

            {(hasAddedInfo || hasUpdatedInfo) && (
              <div className="xl:col-span-1 flex flex-col gap-6">
                {hasAddedInfo && (
                  <UserInfoCard
                    title="Added Info"
                    name={addedByName}
                    date={addedDateFormatted}
                    userId={addedBy}
                    onOpenUser={() =>
                      setSelectedUserForDetails({ userId: addedBy })
                    }
                  />
                )}
                {hasUpdatedInfo && (
                  <UserInfoCard
                    title="Modified Info"
                    name={updatedByName}
                    date={updatedDateFormatted}
                    userId={updatedBy}
                    onOpenUser={() =>
                      setSelectedUserForDetails({ userId: updatedBy })
                    }
                  />
                )}
              </div>
            )}
            <div className="xl:col-span-1 flex flex-col gap-6">
              {description && (
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Description
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-scroll">
                    {displayFormat(description)}
                  </div>
                </div>
              )}
              {instructionPdfUrl && (
                <div className="bg-white rounded-xl hover:shadow-lg transition p-6 border border-gray-100 flex flex-col ">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Instructions
                  </h3>
                  <div className="mt-2 pt-2 gap-4 max-h-[200px] overflow-y-scroll">
                    <a
                      href={instructionPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1565c0] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0f57a6] transition-colors w-max cursor-pointer"
                    >
                      <FileText size={18} />
                      View Instruction PDF
                      <ExternalLink size={16} className="ml-1 opacity-70" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SideDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        moduleName="Process"
        mode="edit"
        data={data}
        onSuccess={() => {
          setIsEditDrawerOpen(false);
          router.refresh();
        }}
      />

      <SideDrawer
        open={!!selectedCompanyForDetails}
        onClose={() => setSelectedCompanyForDetails(null)}
        moduleName="Company"
        mode="details"
        data={
          selectedCompanyForDetails
            ? { id: selectedCompanyForDetails.companyId }
            : null
        }
      />

      <SideDrawer
        open={!!selectedWorkCentreForDetails}
        onClose={() => setSelectedWorkCentreForDetails(null)}
        moduleName="WorkCentre"
        mode="details"
        data={
          selectedWorkCentreForDetails
            ? { id: selectedWorkCentreForDetails.workCentreId }
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

