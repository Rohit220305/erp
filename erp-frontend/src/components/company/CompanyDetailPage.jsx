"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import DetailRow from "./DetailsRow";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import SideDrawer from "@/components/common/SideDrawer";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function CompanyDetailsPage({ company }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can, user: currentUser } = useAuth();
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
          { label: "Company Master", href: "/company" },
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
  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition     p-5">
            <div className=" items-center gap-4 mb-4">
              <SharedImageZoom
                id={`detail-company-${company.id}`}
                src={company.logoUrl}
                alt={company.companyName}
                placeholderText={<Building2 size={24} />}
                thumbnailClassName="w-16 h-16 rounded-xl object-cover border-2 border-blue-100 shadow mb-2"
                modalImageClassName="w-72 h-72 rounded-xl shadow-2xl"
              />
              <div>
                <h2 className="font-semibold text-md">
                  {company.companyName || ""}
                </h2>

                <p className="text-gray-500">{company.shortName}</p>
              </div>
            </div>

            <hr className="my-4" />

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-sm">
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="font-semibold mb-5">Details</h3>

              <DetailRow label="Company Name" value={company.companyName} />

              <DetailRow label="Short Name" value={company.shortName} />

              <DetailRow
                label="Parent Company"
                value={company.parentCompanyName || "-"}
              />

              <DetailRow label="Legal Name" value={company.legalName || "-"} />

              <DetailRow label="Website" value={company.website || "-"} />

              <DetailRow
                label="Registration Number"
                value={company.registrationNumber || "-"}
              />

              <DetailRow label="Tax Number" value={company.taxNumber || "-"} />

              <DetailRow label="Zip Code" value={company.zipCode || "-"} />

              <DetailRow
                label="Currency"
                value={
                  company?.currencies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {company.currencies.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5  text-gray-700 rounded  font-medium"
                        >
                          {c.currencySymbol}
                        </span>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )
                }
              />

              <DetailRow
                label="Status"
                value={
                  <span
                    className={`font-medium ${
                      company.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {company.status}
                  </span>
                }
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Contact Info</h3>

                <DetailRow
                  label="Phone"
                  value={company.dialCode + " " + company.phone}
                />

                <DetailRow label="Email" value={company.email} />

                <DetailRow
                  label="Contact Person"
                  value={company.contactPersonName || "-"}
                />
              </div>

              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Company Address</h3>

                <div className="flex gap-3 mb-3">
                  <Building2 size={18} className="text-blue-600 mt-1" />

                  <div>{company.companyName}</div>
                </div>

                <div className="flex gap-3">
                  <MapPin size={18} className="text-blue-600 mt-1" />

                  <div>
                    {[
                      company.addressLine1,
                      company.addressLine2,
                      company.city,
                      company.state,
                      company.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Audit Info</h3>
                {company.addedByName && (
                  <DetailRow label="Added By" value={company.addedByName} />
                )}
                {company.addedDateFormatted && (
                  <DetailRow label="Added Date" value={company.addedDateFormatted} />
                )}
                {company.updatedByName && (
                  <DetailRow label="Updated By" value={company.updatedByName} />
                )}
                {company.updatedDateFormatted && (
                  <DetailRow label="Updated Date" value={company.updatedDateFormatted} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SideDrawer
        open={!!selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
        moduleName="User"
        mode="details"
        data={selectedUserForDetails}
      />
    </div>
  );
}
