"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useRouter } from "next/navigation";
import { Coins } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import ModuleLink from "@/components/common/ModuleLink";
import SideDrawer from "@/components/common/SideDrawer";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

const DetailRow = ({ label, value, valueNode }) => {
  if (!value && !valueNode) return null;
  return (
    <div className="grid grid-cols-[140px_1fr] items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      {valueNode ? valueNode : (
        <span className="text-gray-900">{displayFormat(value)}</span>
      )}
    </div>
  );
};

export default function CurrencyDetailPage({ currency }) {
  const { setConfig, resetConfig } = useHeader();
  const router = useRouter();
  const { can } = useAuth();
  const [sideDrawerState, setSideDrawerState] = useState({
    isOpen: false,
    moduleName: null,
    id: null,
  });

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
          { label: "Currency Master", href: buildRoute("currency", "list") },
        ],
        actionButton: can(CAPABILITIES.CURRENCY.UPDATE)
          ? {
              label: "Edit",
              onClick: () => router.push(buildRoute("currency", "edit", { id: currency?.id })),
            }
          : null,
      },
    });

    return () => {
      resetConfig();
    };
  }, [setConfig, router, currency?.id, resetConfig, can]);

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

  const addedByUserId = currency?.addedBy || currency?.addedById;
  const updatedByUserId = currency?.updatedBy || currency?.updatedById;

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl text-3xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  {currency.currencySymbol || currency.currencyCode?.[0] || "C"}
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900 leading-tight">
                    {displayFormat(currency.currencyName)}
                  </h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {displayFormat(currency.currencyCode)}
                  </p>
                </div>
              </div>
              <StatusBadge status={currency.status} />
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
             
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 break-inside-avoid">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                  Added Info
                </h3>
                <div>
                  {currency.addedByName &&
                  addedByUserId &&
                  can(CAPABILITIES.USER.VIEW) ? (
                    <ModuleLink
                      href={buildRoute("user", "detail", { id: addedByUserId })}
                      onClick={() =>
                        setSideDrawerState({
                          isOpen: true,
                          moduleName: "User",
                          id: addedByUserId,
                        })
                      }
                      className="text-[#1565c0] font-medium block"
                    >
                      {currency.addedByName}
                    </ModuleLink>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {displayFormat(currency.addedByName)}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-0.5">
                    {displayFormat(currency.addedDateFormatted, "DATE")}
                  </p>
                </div>
              </div>

              {currency.updatedDateFormatted && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-5 text-base border-b border-gray-100 pb-3">
                    Updated Info
                  </h3>
                  <div>
                    {currency.updatedByName &&
                    updatedByUserId &&
                    can(CAPABILITIES.USER.VIEW) ? (
                      <ModuleLink
                        href={buildRoute("user", "detail", {
                          id: updatedByUserId,
                        })}
                        onClick={() =>
                          setSideDrawerState({
                            isOpen: true,
                            moduleName: "User",
                            id: updatedByUserId,
                          })
                        }
                        className="text-[#1565c0] font-medium block"
                      >
                        {currency.updatedByName}
                      </ModuleLink>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {displayFormat(currency.updatedByName)}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-0.5">
                      {displayFormat(currency.updatedDateFormatted, "DATE")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SideDrawer
        open={sideDrawerState.isOpen}
        onClose={() =>
          setSideDrawerState({ isOpen: false, moduleName: null, id: null })
        }
        moduleName={sideDrawerState.moduleName}
        mode="details"
        data={sideDrawerState.id ? { id: sideDrawerState.id } : null}
      />
    </div>
  );
}

