import ModuleLink from "@/components/common/ModuleLink";
import { buildRoute } from "@/lib/navigation/routeBuilder";
import { CAPABILITIES } from "@/config/capabilities.config";
import { LogIn, RotateCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { displayFormat } from "@/utils/no-data-formatter";
import StatusBadge from "@/components/common/StatusBadge";

export default function UserTableRow({
  user: userRecord,
  currentUser,
  handleLoginAs,
  setSelectedUserForPasswordReset,
  setSelectedUserForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can } = useAuth();
  const hasViewPerm = can(CAPABILITIES.USER.VIEW);
  const isActive = userRecord?.status === "Active" || userRecord?.status === "active";
  
  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <SharedImageZoom
            id={`table-${userRecord?.id}`}
            src={userRecord?.photoUrl}
            alt={userRecord?.fullName}
            placeholderText={userRecord?.fullName ? userRecord.fullName.substring(0, 2).toUpperCase() : ""}
            thumbnailClassName="w-12 h-12 rounded-full object-cover border border-gray-200"
            modalImageClassName="w-64 h-64 rounded-full"
          />
          <div>
            {hasViewPerm ? (
              <ModuleLink
                href={buildRoute("user", "detail", { id: userRecord?.id })}
                onClick={() => setSelectedUserForDetails?.(userRecord)}
                className="text-[15px]"
              >
                {displayFormat(userRecord?.fullName)}
              </ModuleLink>
            ) : (
              <p className="font-medium text-gray-800 text-[15px]">
                {displayFormat(userRecord?.fullName)}
              </p>
            )}
            <p className="text-xs text-gray-400">{displayFormat(userRecord?.userName)}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {displayFormat(userRecord?.email)}
      </td>

      <td className="px-4 py-3 text-sm">
        {userRecord?.isSuperAdmin ? (
          <span className="font-medium text-gray-400 italic">System</span>
        ) : can(CAPABILITIES.COMPANY.VIEW) ? (
          <ModuleLink
            href={userRecord?.companyId ? buildRoute("company", "detail", { id: userRecord.companyId }) : "#"}
            onClick={() => setSelectedCompanyForDetails?.(userRecord)}
            className="font-medium"
          >
            {displayFormat(userRecord?.companyName)}
          </ModuleLink>
        ) : (
          <span className="font-medium text-gray-800">{displayFormat(userRecord?.companyName)}</span>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {displayFormat(userRecord?.groupName)}
      </td>

      {currentUser?.isSuperAdmin && (<td className="px-4 py-3 text-sm">
        {userRecord?.id !== currentUser?.id ? (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLoginAs(userRecord?.id);
              }}
              className="flex items-center gap-1 p-1.5 cursor-pointer rounded-full text-xs font-medium w-fit transition hover:bg-blue-100 text-blue-600"
              title="Login As"
            >
              <LogIn size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForPasswordReset(userRecord);
              }}
              className="flex items-center gap-1 cursor-pointer rounded-full text-xs font-medium w-fit transition hover:bg-gray-200 p-1.5 text-gray-600"
              title="Reset Password"
            >
              <RotateCw size={16} /> 
            </button>
          </div>
        ) : (
          <span className="text-gray-400 text-xs italic">Current User</span>
        )}
      </td>)}

      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
        {displayFormat(userRecord?.lastLoginDateFormatted, "DATE")}
      </td>

      <td className="px-4 py-3 text-sm">
        <StatusBadge status={userRecord?.status} />
      </td>
    </tr>
  );
}
