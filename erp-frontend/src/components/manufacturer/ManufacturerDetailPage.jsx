"use client";

import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-[140px_1fr] items-center py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default function ManufacturerDetailPage({ data }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can, user } = useAuth();
  
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
        showSearch: true,
      },
      navbar: {
        title: "Details",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Manufacturer", href: "/manufacturer" },
        ],
        actionButton: can(CAPABILITIES.MANUFACTURER?.UPDATE || "MANUFACTURER_UPDATE")
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
    !data.manufacturerName
  ) {
    if (data?.accessDenied) {
      return <AccessDenied missingPermission={data.requiredPermission || CAPABILITIES.MANUFACTURER?.VIEW || "MANUFACTURER_VIEW"} />;
    }
    return <div className="p-6 text-gray-500">Manufacturer data could not be loaded.</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl text-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                {data.manufacturerCode?.[0] || data.manufacturerName?.[0] || "M"}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 leading-tight">
                  {data.manufacturerName}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {data.manufacturerCode}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-semibold ${data.status === "Active" ? "text-green-600" : "text-red-500"}`}
                >
                  {data.status}
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
              <DetailRow label="Manufacturer Name" value={data.manufacturerName} />
              {user?.isSuperAdmin && (
                <DetailRow label="Company" value={data.companyName || "-"} />
              )}
              <DetailRow label="Manufacturer Code" value={data.manufacturerCode || "-"} />
              <DetailRow label="Reference Code" value={data.referenceCode || "-"} />
              <DetailRow
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      data.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {data.status}
                  </span>
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 break-inside-avoid">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                  Added info
                </h3>
                <div>
                  <p className="text-gray-900 font-medium">{data.addedByName || "System"}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {data.addedDateFormatted || "-"}
                  </p>
                </div>
              </div>

              {data.updatedDateFormatted && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                    Updated info
                  </h3>
                  <div>
                    <p className="text-gray-900 font-medium">{data.updatedByName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {data.updatedDateFormatted}
                    </p>
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
        moduleName="Manufacturer"
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
