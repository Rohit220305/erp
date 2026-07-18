import React from "react";
import Link from "next/link";
import { resolvePath, resolveDynamicRoute } from "./utils/pathResolver";
import { useAuth } from "@/context/AuthContext";
import { Building2 } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ActionRenderer from "./ActionRenderer";

export default function CellRenderer({
  item,
  company, 
  column,
  config,
  companyConfig,
  onRowAction,
  setSelectedItemForDetails,
  setSelectedCompanyForDetails 
}) {
  const { can } = useAuth();

  const data = item || company;
  const cfg = config || companyConfig;
  const openDetails = setSelectedItemForDetails || setSelectedCompanyForDetails;

  const value = resolvePath(data, column.key);

  switch (column.type) {
    case "image":
      return (
        <SharedImageZoom
          id={`table-img-${data?.id}-${column.key}`}
          src={value}
          alt={data?.companyName || "Image"}
          placeholderText={<Building2 size={22} />}
          thumbnailClassName="h-10 w-10 rounded-xl object-cover"
          modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
        />
      );

    case "link": {
      if (!value) return <span>-</span>;
      
      const viewPermission = cfg?.permissions?.view || "COMPANY_VIEW";
      
      if (openDetails) {
        return can(viewPermission) ? (
          <span
            onClick={() => openDetails(data)}
            className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
          >
            {value || "—"}
          </span>
        ) : (
          <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
        );
      }
      
      const href = resolveDynamicRoute(column.linkPath || "#", data);
      
      return can(viewPermission) ? (
        <Link href={href} className="block w-fit text-[#1565c0] ">
          <p className="text-sm font-medium hover:underline">{value || "—"}</p>
        </Link>
      ) : (
        <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
      );
    }

    case "actions": {
      return (
        <ActionRenderer
          item={data}
          actions={cfg?.actions?.row || []}
          onActionClick={onRowAction}
        />
      );
    }

    case "statusBadge":
    case "status":
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            value === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {value || "-"}
        </span>
      );

    case "phone":
      return (
        <span>
          {data?.dialCode ? `${data.dialCode} ` : ""}
          {value || "-"}
        </span>
      );

    case "text":
    default:
      return <span>{value || "-"}</span>;
  }
}
