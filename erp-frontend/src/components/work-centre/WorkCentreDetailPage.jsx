"use client";

import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Factory } from "lucide-react";
import SideDrawer from "@/components/common/SideDrawer";
import ModuleLink from "@/components/common/ModuleLink";

function DetailRow({ label, value, valueClassName = "" }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-right ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}

function UserInfoCard({ title, name, date, userId, onOpenUser }) {
  const initial = name ? name.charAt(0).toUpperCase() : "S";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
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
              {name || "System"}
            </span>
          )}
          {date && <span className="text-xs text-gray-400 mt-1">{date}</span>}
        </div>
      </div>
    </div>
  );
}

export default function WorkCentreDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can, user } = useAuth();
  
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] =
    useState(null);
  const [
    selectedWorkCentreCategoryForDetails,
    setSelectedWorkCentreCategoryForDetails,
  ] = useState(null);
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
          { label: "Home", href: "/" },
          { label: "Work Centre", href: buildRoute("work-centre", "list") },
        ],
        actionButton: can(
          CAPABILITIES.WORK_CENTRE?.UPDATE || "WORK_CENTRE_UPDATE",
        )
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
            data.requiredPermission || CAPABILITIES.WORK_CENTRE?.VIEW || "WORK_CENTRE_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500">Work Centre data could not be loaded.</div>
    );
  }

  const {
    id,
    workCentreName,
    workCentreCode,
    status,
    usageStatus,
    imageUrl,
    categoryId,
    categoryName,
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
  
  const getUsageStatusColor = (usage) => {
    switch (usage) {
      case "Available": return "text-green-500";
      case "Inuse": return "text-blue-500";
      case "Maintenance": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  const hasAddedInfo = Boolean(addedByName || addedDateFormatted || addedBy);
  const hasUpdatedInfo = Boolean(
    updatedByName || updatedDateFormatted || updatedBy,
  );

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900">
                {workCentreName}
              </h2>
              {workCentreCode && (
                <p className="text-gray-400 text-sm mt-0.5 uppercase">
                  {workCentreCode}
                </p>
              )}
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
                  id={`detail-workcentre-${id}`}
                  src={imageUrl}
                  alt={workCentreName}
                  placeholderText={
                    <Factory size={24} className="text-[#1565c0]" />
                  }
                  thumbnailClassName="w-16 h-16 rounded-full object-cover border-4 border-blue-50 shadow-sm shrink-0 bg-gray-50 flex items-center justify-center"
                  modalImageClassName="w-72 h-72 rounded-full shadow-2xl"
                />
                <div className="flex flex-col">
                  <h2 className="font-semibold text-base text-gray-900">
                    {workCentreName}
                  </h2>
                  {workCentreCode && (
                    <span className="text-xs text-gray-400 uppercase mt-0.5">
                      {workCentreCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Work Centre Name" value={workCentreName} />
                <DetailRow label="Work Centre Code" value={workCentreCode} />
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
                {categoryName && (
                  <DetailRow
                    label="Category"
                    value={
                      <ModuleLink
                        href={buildRoute("work-centre-category", "detail", {
                          id: categoryId,
                        })}
                        onClick={() =>
                          setSelectedWorkCentreCategoryForDetails({
                            categoryId,
                          })
                        }
                        className="text-[#1565c0] font-medium hover:underline cursor-pointer"
                      >
                        {categoryName}
                      </ModuleLink>
                    }
                  />
                )}
                <DetailRow
                  label="Usage Status"
                  value={usageStatus}
                  valueClassName={getUsageStatusColor(usageStatus)}
                />
                <DetailRow
                  label="Status"
                  value={status}
                  valueClassName={isActive ? "text-green-500" : "text-red-500"}
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
          </div>
        </div>
      </div>

      <SideDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        moduleName="WorkCentre"
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
        open={!!selectedWorkCentreCategoryForDetails}
        onClose={() => setSelectedWorkCentreCategoryForDetails(null)}
        moduleName="WorkCentreCategory"
        mode="details"
        data={
          selectedWorkCentreCategoryForDetails
            ? { id: selectedWorkCentreCategoryForDetails.categoryId }
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
