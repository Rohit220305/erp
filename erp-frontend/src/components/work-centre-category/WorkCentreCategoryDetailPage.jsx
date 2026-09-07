"use client";

import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import ModuleLink from "@/components/common/ModuleLink";

const DetailRow = ({ label, value, href, onClick, valueClassName = "" }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[140px_1fr] items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      {href ? (
        <ModuleLink href={href} onClick={onClick} className="text-[#1565c0] font-medium text-sm">
          {value}
        </ModuleLink>
      ) : (
        <span className={`text-gray-900 ${valueClassName}`}>{value}</span>
      )}
    </div>
  );
};

export default function WorkCentreCategoryDetailPage({ category: categoryProp, data: dataProp }) {
  const category = categoryProp || dataProp;
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can, user } = useAuth();
  
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");

  useEffect(() => {
    setConfig({
      header: {
        actionButton: null,
        icons: ["refresh"],
        showBookmark: true,
        showLanguage: true,
        showProfile: true,
        showMenu: true,
        showSearch: true,
      },
      navbar: {
        title: "Details",
        breadcrumbs: [
          { label: "Home", href: buildRoute("home", "list") },
          { label: "Work Centre Category Master", href: buildRoute("work-centre-category", "list") },
        ],
        actionButton: can(CAPABILITIES.WORK_CENTRE_CATEGORY?.UPDATE || "WORK_CENTRE_CATEGORY_UPDATE")
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
  }, [setConfig, router, category?.id, resetConfig, can]);

  if (
    !category ||
    category.success === 0 ||
    category.settings?.success === 0 ||
    !category.categoryName
  ) {
    if (category?.accessDenied) {
      return <AccessDenied missingPermission={category.requiredPermission || CAPABILITIES.WORK_CENTRE_CATEGORY?.VIEW || "WORK_CENTRE_CATEGORY_VIEW"} />;
    }
    return <div className="p-6 text-gray-500">Category data could not be loaded.</div>;
  }

  const addedByUserId = category?.addedBy || category?.addedById || category?.added_by || category?.createdBy;
  const updatedByUserId = category?.updatedBy || category?.updatedById || category?.updated_by;

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-4">
              
              <div>
                <h2 className="font-semibold text-lg text-gray-900 leading-tight">
                  {category.categoryName}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {category.categoryCode}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-semibold ${category.status === "Active" ? "text-green-600" : "text-red-500"}`}
                >
                  {category.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-9">
          <div className="columns-1 xl:columns-2 gap-6 text-sm">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 break-inside-avoid">
              <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                Core Information
              </h3>
              <DetailRow label="Category Name" value={category.categoryName} />
              <DetailRow label="Category Code" value={category.categoryCode} />
              {user?.isSuperAdmin && (
                <DetailRow
                  label="Company"
                  value={category.companyName}
                  href={canViewCompany && category?.companyId ? buildRoute("company", "detail", { id: category.companyId }) : null}
                  onClick={canViewCompany && category?.companyId ? () => setSelectedCompanyForDetails({ companyId: category.companyId }) : null}
                />
              )}
              <DetailRow
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      category.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.status}
                  </span>
                }
              />
            </div>

            {(category.addedByName || category.addedDateFormatted || addedByUserId || category.updatedByName || category.updatedDateFormatted || updatedByUserId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 break-inside-avoid">
                {(category.addedByName || category.addedDateFormatted || addedByUserId) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                      Added info
                    </h3>
                    <div>
                      {canViewUser && (addedByUserId || category?.addedByName) ? (
                        <ModuleLink
                          href={addedByUserId ? buildRoute("user", "detail", { id: addedByUserId }) : "#"}
                          onClick={addedByUserId ? () => setSelectedUserForDetails({ userId: addedByUserId }) : null}
                          className="text-[#1565c0] font-medium text-sm"
                        >
                          {category.addedByName || "System"}
                        </ModuleLink>
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{category.addedByName || "System"}</p>
                      )}
                      {category.addedDateFormatted && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {category.addedDateFormatted}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(category.updatedByName || category.updatedDateFormatted || updatedByUserId) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                      Updated info
                    </h3>
                    <div>
                      {canViewUser && (updatedByUserId || category?.updatedByName) ? (
                        <ModuleLink
                          href={updatedByUserId ? buildRoute("user", "detail", { id: updatedByUserId }) : "#"}
                          onClick={updatedByUserId ? () => setSelectedUserForDetails({ userId: updatedByUserId }) : null}
                          className="text-[#1565c0] font-medium text-sm"
                        >
                          {category.updatedByName || "System"}
                        </ModuleLink>
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{category.updatedByName || "System"}</p>
                      )}
                      {category.updatedDateFormatted && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {category.updatedDateFormatted}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <SideDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        moduleName="WorkCentreCategory"
        mode="edit"
        data={category}
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
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails ? { id: selectedUserForDetails.userId } : null}
      />
    </div>
  );
}
