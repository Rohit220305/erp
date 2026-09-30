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

import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

const DetailRow = ({ label, value, href, onClick, valueClassName = "", valueNode }) => {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      {valueNode ? (
        valueNode
      ) : href ? (
        <ModuleLink
          href={href}
          onClick={onClick}
          className="text-[#1565c0] font-medium text-sm"
        >
          {displayFormat(value)}
        </ModuleLink>
      ) : (
        <span className={`text-gray-900 ${valueClassName}`}>
          {displayFormat(value)}
        </span>
      )}
    </div>
  );
};

export default function ItemCategoryDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can, user } = useAuth();
  
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
  const [selectedItemCategoryForDetails, setSelectedItemCategoryForDetails] = useState(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const canViewCompany = can(CAPABILITIES.COMPANY?.VIEW || "COMPANY_VIEW");
  const canViewCategory = can(CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW");
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
          { label: "Master", href: buildRoute("home", "list") },
          { label: "Item Category", href: buildRoute("item-category", "list") },
        ],
        actionButton: can(CAPABILITIES.ITEM_CATEGORY?.UPDATE || "ITEM_CATEGORY_UPDATE")
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

  if (
    !data ||
    data.success === 0 ||
    data.settings?.success === 0 ||
    !data.categoryName
  ) {
    if (data?.accessDenied) {
      return <AccessDenied missingPermission={data.requiredPermission || CAPABILITIES.ITEM_CATEGORY?.VIEW || "ITEM_CATEGORY_VIEW"} />;
    }
    return <div className="p-6 text-gray-500">Item Category data could not be loaded.</div>;
  }

  const addedByUserId = data?.addedBy || data?.addedById || data?.added_by || data?.createdBy;
  const updatedByUserId = data?.updatedBy || data?.updatedById || data?.updated_by;

  const storageTypesValue = data.mappedStorageNames || data.storageNames;

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-4">
              
              <div>
                <h2 className="font-semibold text-lg text-gray-900 leading-tight">
                  {data.categoryName}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {data.categoryCode}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <StatusBadge status={data.status} />
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
              <DetailRow label="Category Name" value={data.categoryName} />
              {user?.isSuperAdmin && (
                <DetailRow
                  label="Company"
                  value={data.companyName}
                  href={canViewCompany && data?.companyId ? buildRoute("company", "detail", { id: data.companyId }) : null}
                  onClick={canViewCompany && data?.companyId ? () => setSelectedCompanyForDetails({ companyId: data.companyId }) : null}
                />
              )}
              <DetailRow label="Category Code" value={data.categoryCode} />
              <DetailRow label="Reference Code" value={data.referenceCode} />
              <DetailRow
                label="Parent Category"
                value={data.parentCategoryName}
                href={canViewCategory && data?.parentId ? buildRoute("item-category", "detail", { id: data.parentId }) : null}
                onClick={canViewCategory && data?.parentId ? () => setSelectedItemCategoryForDetails({ categoryId: data.parentId }) : null}
              />
              <DetailRow label="Storage types" value={storageTypesValue} />
              <DetailRow
                label="Status"
                valueNode={<StatusBadge status={data.status} />}
              />
            </div>

            {(data.addedByName || data.addedDateFormatted || addedByUserId || data.updatedByName || data.updatedDateFormatted || updatedByUserId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 break-inside-avoid">
                {(data.addedByName || data.addedDateFormatted || addedByUserId) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                      Added info
                    </h3>
                    <div>
                      {canViewUser && (addedByUserId || data?.addedByName) ? (
                        <ModuleLink
                          href={addedByUserId ? buildRoute("user", "detail", { id: addedByUserId }) : "#"}
                          onClick={addedByUserId ? () => setSelectedUserForDetails({ userId: addedByUserId }) : null}
                          className="text-[#1565c0] font-medium text-sm"
                        >
                          {data.addedByName || "System"}
                        </ModuleLink>
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{data.addedByName || "System"}</p>
                      )}
                      {data.addedDateFormatted && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {data.addedDateFormatted}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {(data.updatedByName || data.updatedDateFormatted || updatedByUserId) && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                      Updated info
                    </h3>
                    <div>
                      {canViewUser && (updatedByUserId || data?.updatedByName) ? (
                        <ModuleLink
                          href={updatedByUserId ? buildRoute("user", "detail", { id: updatedByUserId }) : "#"}
                          onClick={updatedByUserId ? () => setSelectedUserForDetails({ userId: updatedByUserId }) : null}
                          className="text-[#1565c0] font-medium text-sm"
                        >
                          {data.updatedByName || "System"}
                        </ModuleLink>
                      ) : (
                        <p className="text-gray-900 font-medium text-sm">{data.updatedByName || "System"}</p>
                      )}
                      {data.updatedDateFormatted && (
                        <p className="text-gray-400 text-xs mt-0.5">
                          {data.updatedDateFormatted}
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
        moduleName="ItemCategory"
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
        data={selectedCompanyForDetails ? { id: selectedCompanyForDetails.companyId } : null}
      />

      <SideDrawer
        open={!!selectedItemCategoryForDetails}
        onClose={() => setSelectedItemCategoryForDetails(null)}
        moduleName="ItemCategory"
        mode="details"
        data={selectedItemCategoryForDetails ? { id: selectedItemCategoryForDetails.categoryId } : null}
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
