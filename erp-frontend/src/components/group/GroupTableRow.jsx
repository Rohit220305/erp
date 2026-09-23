import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function GroupTableRow({ group, onRowAction }) {
  const { can } = useAuth();
  const router = useRouter();

  const hasEditPerm = can(CAPABILITIES.GROUP.UPDATE) || can(CAPABILITIES.GROUP.VIEW);
  const isActive = group?.status === "Active" || group?.status === "active";

  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <div>
            {hasEditPerm ? (
              <ModuleLink
                href={buildRoute("group", "edit", { id: group?.id })}
                className="text-sm"
              >
                {displayFormat(group?.groupName)}
              </ModuleLink>
            ) : (
              <p className="font-medium text-gray-800 text-sm">
                {displayFormat(group?.groupName)}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {displayFormat(group?.groupCode)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {displayFormat(group?.description)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {displayFormat(group?.addedDateFormatted, "DATE")}
      </td>
      <td className="px-4 py-3 text-sm">
        <StatusBadge status={group?.status} />
      </td>
    </tr>
  );
}
