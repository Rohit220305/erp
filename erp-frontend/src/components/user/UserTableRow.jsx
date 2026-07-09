import { LogIn, RotateCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserTableRow({
  item,
  columnKey,
  currentUser,
  handleLoginAs,
  setSelectedUserForPasswordReset,
  setSelectedUserForDetails,
  setSelectedCompanyForDetails,
}) {
  const { can } = useAuth();
  const hasViewPerm = can("USER_VIEW");

  if (columnKey === "companyName") {
    return (
      <div>
        {can("COMPANY_VIEW") ? (
          <span
            className="font-medium text-[#1565c0] hover:underline cursor-pointer text-sm"
            onClick={() => setSelectedCompanyForDetails(item)}
          >
            {item.companyName || "-"}
          </span>
        ) : (
          <span className="text-gray-800 text-sm">{item.companyName || "-"}</span>
        )}
      </div>
    );
  }

  if (columnKey === "firstName") {
    return (
      <div className="flex items-center gap-3">
        {item.photoUrl ? (
          <img
            src={item.photoUrl}
            alt={item.firstName}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1565c0] flex items-center justify-center font-semibold text-xs border border-blue-200">
            {item.firstName?.[0]}
            {item.lastName?.[0]}
          </div>
        )}
        <div>
          {hasViewPerm ? (
            <p
              className="font-medium text-[#1565c0] hover:underline cursor-pointer text-sm"
              onClick={() => setSelectedUserForDetails(item)}
            >
              {item.firstName} {item.lastName}
            </p>
          ) : (
            <p className="font-medium text-gray-800 text-sm">
              {item.firstName} {item.lastName}
            </p>
          )}
          <p className="text-xs text-gray-400">{item.userName}</p>
        </div>
      </div>
    );
  }

  if (columnKey === "status") {
    return (
      <div className="flex flex-col gap-1">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
            item.status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {item.status}
        </span>
        {item.isSuperAdmin ? (
          <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full font-medium w-fit">
            Super Admin
          </span>
        ) : null}
      </div>
    );
  }

  if (columnKey === "loginAs") {
    if (item.id === currentUser?.id) {
      return null;
    }
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLoginAs(item.id);
          }}
          className="flex items-center gap-1 px-3 py-1 cursor-pointer rounded-full text-xs font-medium w-fit transition"
          title="Login As"
        >
          <LogIn size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedUserForPasswordReset(item);
          }}
          className="flex items-center gap-1  cursor-pointer rounded-full  text-xs font-medium w-fit   transition"
          title="Reset Password"
        >
          <RotateCw size={16} /> 
        </button>
      </div>
    );
  }

  if (columnKey === "lastLoginDateFormatted") {
    return item.lastLoginDateFormatted || "-";
  }

  return item[columnKey] || "-";
}
