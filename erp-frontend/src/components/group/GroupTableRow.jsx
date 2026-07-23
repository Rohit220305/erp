import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GroupTableRow({
  item,
  columnKey
}) {
  const router = useRouter();
  const { can } = useAuth();
  const hasViewPerm = can("GROUP_VIEW");

  if (columnKey === "groupName") {
    return (
      <div className="flex items-center gap-3">
        
        <div>
          {hasViewPerm ? (
            <p  
              className="font-medium text-[#1565c0] hover:underline cursor-pointer text-sm"
              onClick={() => router.push(`/group/${item.id}`)}
            >
              {item.groupName || "-"}
            </p>
          ) : (
            <p className="font-medium text-gray-800 text-sm">
              {item.groupName || "-"}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (columnKey === "status") {
    const isActive = item.status === "Active" || item.status === "active";
    return (
      <div className="flex flex-col gap-1">
        <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${
          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    );
  }

  if (columnKey === "description") {
    return <span className="text-gray-500 text-sm">{item.description || "-"}</span>;
  }

  return item[columnKey] || "-";
}
