import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function GroupListCard({ group, can }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  if (!group) return null;

  const isActive = group.status === "Active" || group.status === "active";

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div className="grid grid-cols-4 gap-4 items-center flex-1 min-w-0">
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Group Name
              </p>
              <div className="min-w-0">
                {can(CAPABILITIES.GROUP.UPDATE) || can(CAPABILITIES.GROUP.VIEW) ? (
                  <ModuleLink
                    href={buildRoute("group", "edit", { id: group.id })}
                    className="text-sm truncate block"
                  >
                    {displayFormat(group.groupName)}
                  </ModuleLink>
                ) : (
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {displayFormat(group.groupName)}
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Group Code
              </p>
              <p className="text-[13px] text-gray-800 font-medium truncate">
                {displayFormat(group.groupCode)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Added Date
              </p>
              <p className="text-[13px] font-medium text-gray-800 truncate">
                {displayFormat(group.addedDateFormatted, "DATE")}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <div>
                <StatusBadge status={group.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
