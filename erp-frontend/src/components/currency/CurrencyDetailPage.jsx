"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-[140px_1fr] items-center py-2.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 font-medium">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default function CurrencyDetailPage({ currency }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();

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
          { label: "Currency Master", href: "/currency" },
        ],
        actionButton: can(CAPABILITIES.CURRENCY.UPDATE)
          ? {
              label: "Edit",
              onClick: () => router.push(`/currency/edit/${currency.id}`),
            }
          : null,
      },
    });

    return () => {
      resetConfig();
    };
  }, [setConfig, router, currency.id, resetConfig, can]);

  if (
    !currency ||
    currency.success === 0 ||
    currency.settings?.success === 0 ||
    !currency.currencyName
  ) {
    if (currency?.accessDenied) {
      return <AccessDenied missingPermission={currency.requiredPermission || CAPABILITIES.CURRENCY.VIEW} />;
    }
    return <div className="p-6 text-gray-500">Currency data could not be loaded.</div>;
  }
  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl text-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                {currency.currencySymbol || currency.currencyCode?.[0] || "C"}
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900 leading-tight">
                  {currency.currencyName}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {currency.currencyCode}
                </p>
              </div>
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-semibold ${currency.status === "Active" ? "text-green-600" : "text-red-500"}`}
                >
                  {currency.status}
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
              <DetailRow label="Currency Name" value={currency.currencyName} />
              <DetailRow label="Currency Code" value={currency.currencyCode} />
              <DetailRow
                label="Currency Symbol"
                value={currency.currencySymbol || "-"}
              />
              <DetailRow
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      currency.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currency.status}
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
                  <p className="text-gray-900 font-medium">{currency.addedByName || "-"}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {currency.addedDateFormatted}
                  </p>
                </div>
              </div>

              {currency.updatedDateFormatted && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                    Updated info
                  </h3>
                  <div>
                   
                    <p className="text-gray-900 font-medium">{currency.updatedByName || "-"}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {currency.updatedDateFormatted}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
