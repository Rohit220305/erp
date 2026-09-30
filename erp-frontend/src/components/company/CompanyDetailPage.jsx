"use client";

import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { Building2, MapPin } from "lucide-react";
import DetailRow from "./DetailsRow";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

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

export default function CompanyDetailsPage({ company }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState(null);
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
        showSearch: true,
      },
      navbar: {
        title: "Details",
        breadcrumbs: [
          { label: "Master", href: "/" },
          { label: "Company Master", href: buildRoute("company", "list") },
        ],
        actionButton: can(CAPABILITIES.COMPANY.UPDATE)
          ? {
              label: "Edit",
              onClick: () => router.push(`/company/${company.id}/edit-company`),
            }
          : null,
      },
    });
    return () => {
      resetConfig();
    };
  }, [setConfig, router, company.id, resetConfig, can]);

  if (
    !company ||
    company.success === 0 ||
    company.settings?.success === 0 ||
    !company.companyName
  ) {
    if (company?.accessDenied) {
      return <AccessDenied missingPermission={company.requiredPermission || CAPABILITIES.COMPANY.VIEW} />;
    }
    return <div className="p-6 text-gray-500">Company data could not be loaded.</div>;
  }
  console.log("company", company);
  const {
    id,
    companyName,
    shortName,
    parentCompanyId,
    parentCompanyName,
    legalName,
    website,
    registrationNumber,
    taxNumber,
    zipCode,
    dialCode,
    phone,
    email,
    contactPersonName,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    currencies,
    status,
    addedBy,
    addedByName,
    addedDateFormatted,
    updatedBy,
    updatedByName,
    updatedDateFormatted,
  } = company;

  const hasAddress = Boolean(addressLine1 || addressLine2 || city || state || country);
  const hasContactInfo = Boolean(phone || email || contactPersonName);
  const hasAddedInfo = Boolean(addedByName || addedDateFormatted || addedBy);
  const hasUpdatedInfo = Boolean(updatedByName || updatedDateFormatted || updatedBy);

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-full">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="items-center gap-4 mb-4">
              <SharedImageZoom
                id={`detail-company-${id}`}
                src={company.logoUrl}
                alt={companyName}
                placeholderText={<Building2 size={24} />}
                thumbnailClassName="w-16 h-16 rounded-xl object-cover border-2 border-blue-100 shadow mb-2"
                modalImageClassName="w-72 h-72 rounded-xl shadow-2xl"
              />
              <div>
                <h2 className="font-semibold text-md text-gray-900">
                  {displayFormat(companyName)}
                </h2>
                {shortName && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    {displayFormat(shortName)}
                  </p>
                )}
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <button className="w-full bg-[#1565c0] text-white py-3 rounded-lg text-sm font-medium transition hover:bg-[#0f57a6]">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-sm">
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="font-semibold text-gray-600 mb-5">Details</h3>

              {companyName && (
                <DetailRow label="Company Name" value={companyName} />
              )}
              {shortName && <DetailRow label="Short Name" value={shortName} />}
              {parentCompanyName && (
                <DetailRow
                  label="Parent Company"
                  value={
                    <ModuleLink
                      href={buildRoute("company", "detail", {
                        id: parentCompanyId,
                      })}
                      onClick={() =>
                        setSelectedCompanyForDetails({
                          companyId: parentCompanyId,
                        })
                      }
                      className="text-[#1565c0] font-medium hover:underline cursor-pointer"
                    >
                      {parentCompanyName}
                    </ModuleLink>
                  }
                />
              )}
              {legalName && <DetailRow label="Legal Name" value={legalName} />}
              {website && <DetailRow label="Website" value={website} />}
              {registrationNumber && (
                <DetailRow
                  label="Registration Number"
                  value={registrationNumber}
                />
              )}
              {taxNumber && <DetailRow label="Tax Number" value={taxNumber} />}
              {zipCode && <DetailRow label="Zip Code" value={zipCode} />}

              {currencies?.length > 0 && (
                <DetailRow
                  label="Currency"
                  value={
                    <div className="flex flex-wrap gap-1 mt-1 justify-end">
                      {currencies.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-gray-700 text-xs font-medium"
                        >
                          {c.currencySymbol} ({c.currencyCode})
                        </span>
                      ))}
                    </div>
                  }
                />
              )}

              {status && (
                <DetailRow
                  label="Status"
                  valueNode={<StatusBadge status={status} />}
                />
              )}
            </div>

            {(hasContactInfo || hasAddress) && (
              <div className="space-y-6">
                {hasContactInfo && (
                  <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                    <h3 className="font-semibold text-gray-600 mb-5">
                      Contact Info
                    </h3>
                    {phone && (
                      <DetailRow
                        label="Phone"
                        value={`${dialCode || ""} ${phone}`.trim()}
                      />
                    )}
                    {email && <DetailRow label="Email" value={email} />}
                    {contactPersonName && (
                      <DetailRow
                        label="Contact Person"
                        value={contactPersonName}
                      />
                    )}
                  </div>
                )}

                {hasAddress && (
                  <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                    <h3 className="font-semibold text-gray-600 mb-5">
                      Company Address
                    </h3>
                    <div className="flex gap-3 mb-3">
                      <Building2
                        size={18}
                        className="text-[#1565c0] mt-1 shrink-0"
                      />
                      <div className="font-medium text-gray-900">
                        {companyName}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <MapPin
                        size={18}
                        className="text-[#1565c0] mt-1 shrink-0"
                      />
                      <div className="text-gray-700 leading-relaxed">
                        {[addressLine1, addressLine2, city, state, country]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(hasAddedInfo || hasUpdatedInfo) && (
              <div className="space-y-6">
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
