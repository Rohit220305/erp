import React from "react";
import Link from "next/link";
import { resolvePath } from "./utils/pathResolver";
import { useAuth } from "@/context/AuthContext";
import { Building2 } from "lucide-react";
import SharedImageZoom from "@/components/common/SharedImageZoom";

export default function CellRenderer({ company, column, companyConfig, setSelectedCompanyForDetails }) {
  const { can } = useAuth();
  
  const value = resolvePath(company, column.key);
  switch (column.type) {
    case "image":
      return (
        <SharedImageZoom
          id={`table-img-${company.id}-${column.key}`}
          src={value}
          alt={company.companyName || "Company Logo"}
          placeholderText={<Building2 size={22} />}
          thumbnailClassName="h-10 w-10 rounded-xl object-cover"
          modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
        />
      );

    case "link": {
      if (!value) return <span>-</span>;
      if (setSelectedCompanyForDetails) {
        return (
          can(companyConfig.permissions?.view || "COMPANY_VIEW") ? (
            <span
              onClick={() => setSelectedCompanyForDetails(company)}
              className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
            >
              {value || "—"}
            </span>
          ) : (
            <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
          )
        );
      }
      let href = column.linkPath || "#";
      if (href.includes("{")) {
        const matches = href.match(/\{([^}]+)\}/g);
        if (matches) {
          matches.forEach((match) => {
            const key = match.replace(/[{}]/g, "");
            href = href.replace(match, company[key] || "");
          });
        }
      }
      return (
        
        can(companyConfig.permissions?.view || "COMPANY_VIEW") ? (
          <Link
            href={`/company/${company.id}`}
            className="block w-fit text-[#1565c0] "
          >
            <p className="text-sm font-medium hover:underline">
              {value || "—"}
            </p>
          </Link>
        ) : (
          <p className="text-sm font-medium text-gray-800">{value || "—"}</p>
        )
      );
    }

    case "statusBadge":
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
          {company?.dialCode ? `${company.dialCode} ` : ""}
          {value || "-"}
        </span>
      );

    case "text":
    default:
      return <span>{value || "-"}</span>;
  }
}
