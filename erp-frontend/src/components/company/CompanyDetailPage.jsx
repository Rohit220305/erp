"use client";

import { useRouter } from "next/navigation";
import { Building2, MapPin, Phone, Mail } from "lucide-react";
import DetailRow from "./DetailsRow";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
// import { getAdmin } from "@/lib/api/admin-api";
import { getUser } from "@/lib/api/user-api";
import { useAuth } from "@/context/AuthContext";
export default function CompanyDetailsPage({ company }) {
  // console.log("Company Details:", company); // Debug log
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [addedAdmin, setAddedAdmin] = useState(null);
  const [updatedAdmin, setUpdatedAdmin] = useState(null);

  const fetchAddedBy = async () => {
    try {
      const response = await getUser(company.addedBy);
      // console.log("Added By Admin:", response); // Debug log
      setAddedAdmin(response || []);
    } catch (error) {
      console.error(error);
    }
  };
  const fetchUpdatedBy = async () => {
    try {
      const response = await getUser(company.updatedBy);
      // console.log("Updated By Admin:", response); // Debug log
      setUpdatedAdmin(response || []);
    } catch (error) {
      console.error(error);
    }
  };

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
        actionButton: can("COMPANY_UPDATE") ? {
          label: "edit",
          onClick: () => router.push(`/company/${company.id}/edit-company`),
        } : null,
      },
    });

    fetchAddedBy();
    fetchUpdatedBy();
    return () => {
      resetConfig();
    };
  }, [setConfig, router, company.id, resetConfig, can]);
  console.log(company);
  return (
    <div className="p-6">
      {/* Header */}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}

        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition     p-5">
            <div className="flex items-center gap-4 mb-4">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Company logo"
                  className="w-16 h-16 rounded-xl object-cover border-2 border-blue-100 shadow"
                />
              ) : (
                ""
              )}
              <div>
                <h2 className="font-semibold text-lg">
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

        {/* Content */}

        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Details */}

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

            {/* Contact & Address */}

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

            {/* Third Party */}

            <div className="space-y-6">
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Third Party Settings</h3>

                <DetailRow
                  label="Finance User"
                  value={company.financeUserName || "-"}
                />

                <DetailRow
                  label="Finance Endpoint"
                  value={company.financeEndPointUrl || "-"}
                />

                <DetailRow
                  label="Inventory Token"
                  value={
                    company.inventoryAuthToken
                      ? `${company.inventoryAuthToken.slice(0, 20)}...`
                      : "-"
                  }
                />
              </div>
              {/* added infromation */}
              <div className="bg-white rounded-xl hover:shadow-lg transition p-6">
                <h3 className="font-semibold mb-5">Added Info</h3>

                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() =>
                    company?.addedBy && router.push(`/admin/${company.addedBy}`)
                  }
                >
                  {/* User Logo / Avatar */}
                  {addedAdmin?.photoUrl ? (
                    <img
                      src={addedAdmin.photoUrl}
                      alt="Added by"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs border border-blue-200">
                      {addedAdmin?.firstName?.[0] ||
                        company?.addedBy?.[0] ||
                        "?"}
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-blue-700 group-hover:text-black group-hover:underline block font-medium">
                      {addedAdmin?.firstName && addedAdmin?.lastName
                        ? `${addedAdmin.firstName} ${addedAdmin.lastName}`
                        : company?.addedBy || "-"}
                    </span>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {company?.addedDateFormatted || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Updated information */}
              <div className="bg-white rounded-xl p-6 hover:shadow-lg transition">
                <h3 className="font-semibold mb-5">Updated Info</h3>

                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() =>
                    company?.updatedBy &&
                    router.push(`/admin/${company.updatedBy}`)
                  }
                >
                  {/* User Logo / Avatar */}
                  {updatedAdmin?.photoUrl ? (
                    <img
                      src={updatedAdmin.photoUrl}
                      alt="Updated by"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-medium text-xs border border-gray-200">
                      {updatedAdmin?.firstName?.[0] ||
                        company?.updatedBy?.[0] ||
                        "?"}
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-blue-700 group-hover:text-black  block font-medium">
                      {updatedAdmin?.firstName && updatedAdmin?.lastName
                        ? `${updatedAdmin.firstName} ${updatedAdmin.lastName}`
                        : company?.updatedBy || "-"}
                    </span>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {company?.updatedDateFormatted || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
