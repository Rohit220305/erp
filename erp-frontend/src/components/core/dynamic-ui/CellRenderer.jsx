import React from "react";
import Link from "next/link";
import { resolvePath } from "./utils/pathResolver";
import { useAuth } from "@/context/AuthContext";
import { Building2 } from "lucide-react";

export default function CellRenderer({ company, column, companyConfig }) {
  const { can } = useAuth();
  // console.log("Rendering CellRenderer for company:", company, "column:", column);
  // console.log("Rendering CellRenderer for company:" , "column:", column);
  const value = resolvePath(company, column.key);
  // console.log("Resolved value for column key", column.key, ":", value);
  switch (column.type) {
    case "image":
      return value ? (
        <img
          src={value}
          alt={column.label}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50
                  border-2 border-gray-100 flex flex-col items-center
                  justify-center text-blue-300 gap-1.5  
                  transition-colors"
        >
          <Building2 size={22} />
        </div>
      );

    case "link": {
      if (!value) return <span>-</span>;
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
            <p className="text-sm font-semibold hover:underline">
              {value || "—"}
            </p>
          </Link>
        ) : (
          <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
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
