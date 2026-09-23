import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { MoreVertical } from "lucide-react";
import { displayFormat } from "@/utils/no-data-formatter";

export default function GroupGridCard({ group, onDelete }) {
  const isActive = group.status === "Active" || group.status === "active";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <ModuleLink
          href={buildRoute("group", "edit", { id: group.id })}
          className="flex items-center gap-3"
        >
          <div>
            <p className="text-[#1565c0] font-medium leading-tight mb-0.5 hover:underline decoration-1 underline-offset-2">
              {displayFormat(group.groupName)}
            </p>
            <p className="text-gray-400 text-sm mt-4 leading-tight">
              {displayFormat(group.groupCode)}
            </p>
          </div>
        </ModuleLink>
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-6 text-sm">
        {group.description && (
          <div className="grid grid-cols-[110px_1fr] gap-2">
            <span className="text-gray-400">Description</span>
            <span className="text-gray-900 line-clamp-2">{group.description}</span>
          </div>
        )}
        <div className="grid grid-cols-[110px_1fr] items-center gap-2">
          <span className="text-gray-400">Added Date</span>
          <span className="text-gray-900 truncate">{displayFormat(group.addedDateFormatted, "DATE")}</span>
        </div>
      </div>
    </div>
  );
}
