import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { CAPABILITIES } from "@/config/capabilities.config";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

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
                    {group.groupName || "—"}
                  </ModuleLink>
                ) : (
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {group.groupName || "—"}
                  </p>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Group Code
              </p>
              <p className="text-[13px] text-gray-800 font-medium truncate">
                {group.groupCode || "—"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Added Date
              </p>
              <p className="text-[13px] font-medium text-gray-800 truncate">
                {group.addedDateFormatted || "—"}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                Status
              </p>
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
