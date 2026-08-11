"use client";
import { CAPABILITIES } from "@/config/capabilities.config";
import { LogIn, RotateCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function UserTableRow({
  item,
  currentUser,
  handleLoginAs,
  setSelectedUserForPasswordReset,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can } = useAuth();
  const hasViewPerm = can(CAPABILITIES.USER.VIEW);
  const isActive = item.status === "Active" || item.status === "active";
  
  return (
    <tr className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          <SharedImageZoom
            id={`table-${item.id}`}
            src={item.photoUrl}
            alt={item.fullName}
            placeholderText={item.fullName ? item.fullName.substring(0, 2).toUpperCase() : ""}
            thumbnailClassName="w-12 h-12 rounded-full object-cover border border-gray-200"
            modalImageClassName="w-64 h-64 rounded-full"
          />
          <div>
            {hasViewPerm ? (
              <p
                className="font-medium text-[#1565c0] hover:underline cursor-pointer text-[15px]"
                onClick={() => setSelectedItemForDetails(item)}
              >
                {item.fullName}
              </p>
            ) : (
              <p className="font-medium text-gray-800 text-[15px]">
                {item.fullName}
              </p>
            )}
            <p className="text-xs text-gray-400">{item.userName}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {item.email || "—"}
      </td>

      <td className="px-4 py-3 text-sm">
        {item.isSuperAdmin ? (
          <span className="font-medium text-gray-400 italic">System</span>
        ) : can(CAPABILITIES.COMPANY.VIEW) ? (
          <span
            className="font-medium text-[#1565c0] hover:underline cursor-pointer"
            onClick={() => setSelectedCompanyForDetails(item)}
          >
            {item.companyName || "—"}
          </span>
        ) : (
          <span className="font-medium text-gray-800">{item.companyName || "—"}</span>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {item.groupName || "—"}
      </td>

      {currentUser?.isSuperAdmin && (<td className="px-4 py-3 text-sm">
        {item.id !== currentUser?.id ? (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLoginAs(item.id);
              }}
              className="flex items-center gap-1  p-1.5 cursor-pointer rounded-full text-xs font-medium w-fit transition hover:bg-blue-100 text-blue-600"
              title="Login As"
            >
              <LogIn size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserForPasswordReset(item);
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
        {item.lastLoginDateFormatted || "—"}
      </td>

      <td className="px-4 py-3 text-sm">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
          {isActive ? "Active" : "Inactive"}
        </span>
      </td>
    </tr>
  );
}
