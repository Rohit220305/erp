"use client";

import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Tag, FileText, ExternalLink } from "lucide-react";
import SideDrawer from "@/components/common/SideDrawer";

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
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#1565c0]">
            {name || "System"}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {date || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProcessDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

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
          { label: "Process Master", href: "/process" },
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
  }, [setConfig, router, data?.id, resetConfig, can]);

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
    processName,
    processCode,
    description,
    status,
    imageUrl,
    instructionPdfUrl,
    workCentreName,
    companyName,
    addedByName,
    addedDateFormatted,
    updatedByName,
    updatedDateFormatted,
  } = data;

  const isActive = status === "Active" || status === "active";

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900">
                {processName}
              </h2>
              <p className="text-gray-400 text-sm mt-0.5 uppercase">
                {processCode}
              </p>
            </div>

            <hr className="my-4 border-gray-100" />

            <button className="w-full bg-[#1565c0] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6]">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">
                Details
              </h3>

              <div className="flex items-center gap-4 mb-8">
                <SharedImageZoom
                  id={`detail-process-${data.id}`}
                  src={imageUrl}
                  alt={processName}
                  placeholderText={<Tag size={24} className="text-[#1565c0]" />}
                  thumbnailClassName="w-16 h-16 rounded-full object-cover border-4 border-blue-50 shadow-sm shrink-0 bg-gray-50 flex items-center justify-center"
                  modalImageClassName="w-72 h-72 rounded-full shadow-2xl"
                />
                <div className="flex flex-col">
                  <h2 className="font-semibold text-base text-gray-900">
                    {processName}
                  </h2>
                  <span className="text-xs text-gray-400 uppercase mt-0.5">
                    {processCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Process Name" value={processName} />
                <DetailRow label="Process Code" value={processCode} />
                <DetailRow label="Company" value={companyName} />
                <DetailRow label="Work Centre" value={workCentreName} />
                <DetailRow
                  label="Status"
                  value={status}
                  valueClassName={isActive ? "text-green-500" : "text-red-500"}
                />
              </div>
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Description
                </h3>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {description || (
                    <span className="text-gray-400 italic">
                      No description provided.
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Instructions
                </h3>
               
                {instructionPdfUrl ? (
                  <div className="mt-2 pt-2 ">
                    <a
                      href={instructionPdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1565c0] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0f57a6] transition-colors w-max"
                    >
                      <FileText size={18} />
                      View Instruction PDF
                      <ExternalLink size={16} className="ml-1 opacity-70" />
                    </a>
                  </div>
                ) : "-"}
              </div>
            </div>

            <div className="xl:col-span-1 flex flex-col gap-6">
              <UserInfoCard
                title="Added Info"
                name={addedByName}
                date={addedDateFormatted}
              />
              <UserInfoCard
                title="Modified Info"
                name={updatedByName}
                date={updatedDateFormatted}
              />
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
    </div>
  );
}
