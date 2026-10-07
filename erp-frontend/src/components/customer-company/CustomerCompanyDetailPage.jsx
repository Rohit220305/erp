"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import SideDrawer from "@/components/common/SideDrawer";
import AccessDenied from "@/components/common/AccessDenied";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";

import { getCustomerCompany } from "@/lib/api/customer-company-api";
import { Layers, MapPin } from "lucide-react";

function DetailRow({
  label,
  value,
  href,
  onClick,
  valueNode,
  valueClassName = "",
}) {
  if (!value && !valueNode && value !== 0) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      {valueNode ? (
        valueNode
      ) : href ? (
        <ModuleLink
          href={href}
          onClick={onClick}
          className="text-[#1565c0] font-medium text-sm text-right"
        >
          {displayFormat(value)}
        </ModuleLink>
      ) : (
        <span className={`text-sm font-medium text-right text-gray-900 ${valueClassName}`}>
          {displayFormat(value)}
        </span>
      )}
    </div>
  );
}

function UserInfoCard({ title, name, date, href, onClick }) {
  if (!name && !date && !href) return null;
  const initial = name ? name.charAt(0).toUpperCase() : "U";
  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-5">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-lg font-semibold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="flex flex-col">
          {href ? (
            <ModuleLink
              href={href}
              onClick={onClick}
              className="text-sm font-semibold text-[#1565c0]"
            >
              {displayFormat(name)}
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

export default function CustomerCompanyDetailPage({ id, initialData = null }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  const canViewUser = can(CAPABILITIES.USER?.VIEW || "USER_VIEW");
  const canUpdate = can(
    CAPABILITIES.CUSTOMER_COMPANY?.UPDATE || "CUSTOMER_COMPANY_UPDATE",
  );

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getCustomerCompany({ id });
      const companyData = res?.settings?.data || res?.data;
      if (companyData) {
        setData(companyData);
      }
    } catch (err) {
      console.error("Failed to load details:", err);
      toast.error("Failed to load Customer Company details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData && id) {
      fetchDetails();
    }
  }, [id, initialData]);

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
          { label: "Users" },
          {
            label: "Customer",
            href: buildRoute("customer-company", "list"),
          },
        ],
        actionButtons: [
          ...(canUpdate && data?.id
            ? [
                {
                  label: "Edit",
                  onClick: () =>
                    router.push(
                      buildRoute("customer-company", "edit", { id: data.id }),
                    ),
                },
              ]
            : []),
        ],
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, resetConfig, router, canUpdate, data?.id]);

  if (loading) {
    return <Loader overlay />;
  }

  if (!data || data.success === 0 || data.settings?.success === 0) {
    if (data?.accessDenied) {
      return (
        <AccessDenied
          missingPermission={
            CAPABILITIES.CUSTOMER_COMPANY?.VIEW || "CUSTOMER_COMPANY_VIEW"
          }
        />
      );
    }
    return (
      <div className="p-6 text-gray-500 text-sm">
        Customer Company details could not be loaded.
      </div>
    );
  }

  const ownerName = data.owner
    ? `${data.owner.firstName} ${data.owner.lastName}`.trim()
    : "";
  const ownerInitial = ownerName ? ownerName.charAt(0).toUpperCase() : "U";

  const buildAddressString = () => {
    if (!data.address) return null;
    const parts = [
      data.address.address,
      data.address.city,
      data.address.state,
      data.address.country,
      data.address.zipCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const addressString = buildAddressString();

  return (
    <div className="h-full">
      <div className="grid grid-cols-12 gap-6 h-full ms-10">

        <div className="col-span-2 rounded-xl bg-white hover:shadow-lg transition mb-16">
          <div className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-base text-gray-900 font-mono">
                {displayFormat(data.name)}
              </h2>
              <div className="mt-1 text-sm text-gray-500">
                {displayFormat(data.code)}
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-2">
              <button className="w-full bg-[#1565c0] text-white py-2.5 px-4 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6] text-left">
                Summary
              </button>
            </div>
          </div>
        </div>


        <div className="col-span-10 overflow-y-scroll h-full pe-10 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            

            <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
              <div className="flex items-center gap-4 mb-6">
                {data.logoUrl ? (
                  <SharedImageZoom
                    id={`company-logo-${data.id}`}
                    src={data.logoUrl}
                    alt={data.name}
                    thumbnailClassName="w-16 h-16 rounded-full object-contain bg-gray-50 border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                    <Layers className="text-gray-400" size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {displayFormat(data.name)}
                  </h3>
                  <div className="mt-1">
                    <StatusBadge status={data.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Short Name" value={data.shortName} />
                <DetailRow label="Code" value={data.code} />
                <DetailRow label="Email" value={data.email} />
                <DetailRow
                  label="Incorporation Date"
                  value={data.incorporationDateFormatted}
                />
                <DetailRow
                  label="Phone Number"
                  value={data.address?.phoneNumber ? `${data.address?.phoneCode || ""} ${data.address?.phoneNumber}`.trim() : null}
                />
                <DetailRow
                  label="Alternate Phone Number"
                  value={data.address?.altPhoneNumber ? `${data.address?.altPhoneCode || ""} ${data.address?.altPhoneNumber}`.trim() : null}
                />
              </div>
            </div>


            <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
              <div className="flex items-center gap-4 mb-6">
                {data.owner?.profileImageUrl ? (
                  <SharedImageZoom
                    id={`company-owner-${data.owner?.id}`}
                    src={data.owner.profileImageUrl}
                    alt={ownerName}
                    thumbnailClassName="w-16 h-16 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-full bg-[#1565c0] text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                    {ownerInitial}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {displayFormat(ownerName)}
                  </h3>
                  {data.owner?.status && (
                    <div className="mt-1">
                      <StatusBadge status={data.owner.status} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <DetailRow label="Owner Name" value={ownerName} />
                <DetailRow label="Email" value={data.owner?.email} />
                <DetailRow
                  label="Phone Number"
                  value={data.owner?.phoneNumber ? `${data.owner?.phoneCode || ""} ${data.owner?.phoneNumber}`.trim() : null}
                />
                <DetailRow
                  label="Alternate Phone Number"
                  value={data.owner?.altPhoneNumber ? `${data.owner?.altPhoneCode || ""} ${data.owner?.altPhoneNumber}`.trim() : null}
                />
                {data.owner?.dob && (
                  <DetailRow label="Date of Birth" value={displayFormat(data.owner.dob, "DATE")} />
                )}
                {data.owner?.customDate && (
                  <DetailRow label="Custom Date" value={displayFormat(data.owner.customDate, "DATE")} />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

            <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-6">
                Company Address
              </h3>
              {addressString ? (
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#1565c0] mt-0.5 shrink-0" size={18} />
                  <span className="text-sm text-gray-900">{addressString}</span>
                </div>
              ) : (
                <NoDataMessage moduleName="Company Address" />
              )}
            </div>


            <div className="space-y-6">
              <UserInfoCard
                title="Added Info"
                name={data.addedByName}
                date={data.addedDateFormatted}
                href={
                  canViewUser && data.addedBy
                    ? buildRoute("user", "detail", { id: data.addedBy })
                    : null
                }
                onClick={
                  canViewUser && data.addedBy
                    ? () => setSelectedUserForDetails({ userId: data.addedBy })
                    : null
                }
              />
              <UserInfoCard
                title="Modified Info"
                name={data.updatedByName}
                date={data.updatedDateFormatted}
                href={
                  canViewUser && data.updatedBy
                    ? buildRoute("user", "detail", { id: data.updatedBy })
                    : null
                }
                onClick={
                  canViewUser && data.updatedBy
                    ? () => setSelectedUserForDetails({ userId: data.updatedBy })
                    : null
                }
              />
            </div>
          </div>
        </div>
      </div>

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
