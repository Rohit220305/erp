import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
                {group?.groupName || "—"}
              </ModuleLink>
            ) : (
              <p className="font-medium text-gray-800 text-sm">
                {group?.groupName || "—"}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {group?.groupCode || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {group?.description || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {group?.addedDateFormatted || "—"}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
