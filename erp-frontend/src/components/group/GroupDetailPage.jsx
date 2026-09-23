"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { useHeader } from "@/context/HeaderContext";
import { Tag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AccessDenied from "@/components/common/AccessDenied";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

function DetailRow({ label, value, valueNode }) {
  if (!value && !valueNode) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 min-w-[140px]">{label}</span>
      {valueNode ? (
        valueNode
      ) : (
        <span className="text-sm font-medium text-right">
          {displayFormat(value)}
        </span>
      )}
    </div>
  );
}

export default function GroupDetailPage({ group }) {
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
      },
      navbar: {
        title: "Details",
        breadcrumbs: [
          { label:  "Master" },
          { label: "Group Master", href: buildRoute("group", "list") },
        ],
        actionButton: can(CAPABILITIES.GROUP.UPDATE)
          ? {
              label: "Edit",
              onClick: () =>
                router.push(buildRoute("group", "edit", { id: group?.id })),
            }
          : null,
      },
    });

    return () => resetConfig();
  }, [setConfig, router, group?.id, resetConfig, can]);

  if (
    !group ||
    group.success === 0 ||
    group.settings?.success === 0 ||
    !group.groupName
  ) {
    if (group?.accessDenied) {
      return <AccessDenied missingPermission={group.requiredPermission || CAPABILITIES.GROUP.VIEW} />;
    }
    return <div className="p-6 text-gray-500">Group data could not be loaded.</div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <div className="bg-white rounded-xl hover:shadow-lg transition p-5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <Tag size={22} className="text-[#1565c0]" />
            </div>
            <h2 className="font-semibold text-lg">
              {displayFormat(group?.groupName)}
            </h2>
            <p className="text-gray-500 text-sm">
              {displayFormat(group?.groupCode)}
            </p>
            <hr className="my-4" />
            <button className="w-full bg-[#1565c0] text-white py-3 rounded-lg text-sm font-medium">
              Summary
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="font-semibold mb-5">Details</h3>
              <DetailRow label="Group Code" value={group?.groupCode} />
              <DetailRow label="Group Name" value={group?.groupName} />
              <DetailRow label="Description" value={group?.description} />
              <DetailRow
                label="Status"
                valueNode={<StatusBadge status={group?.status} />}
              />
            </div>

            <div className="xl:col-span-1 bg-white rounded-xl hover:shadow-lg transition p-6">
              <h3 className="font-semibold mb-5">Audit Info</h3>
              {group?.addedByName && (
                <DetailRow label="Added By" value={group.addedByName} />
              )}
              {group?.addedDateFormatted && (
                <DetailRow
                  label="Added Date"
                  value={displayFormat(group.addedDateFormatted, "DATE")}
                />
              )}
              {group?.updatedByName && (
                <DetailRow label="Updated By" value={group.updatedByName} />
              )}
              {group?.updatedDateFormatted && (
                <DetailRow
                  label="Updated Date"
                  value={displayFormat(group.updatedDateFormatted, "DATE")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
