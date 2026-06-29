import React from "react";
import Link from "next/link";
import { resolvePath } from "./utils/pathResolver";

export default function CellRenderer({ item, column }) {
  const value = resolvePath(item, column.key);

  switch (column.type) {
    case "image":
      return value ? (
        <img
          src={value}
          alt={column.label}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-gray-200" />
      );

    case "link": {
      if (!value) return <span>-</span>;
      let href = column.linkPath || "#";
      // Replace {id} or other tokens in the path
      if (href.includes("{")) {
        const matches = href.match(/\{([^}]+)\}/g);
        if (matches) {
          matches.forEach((match) => {
            const key = match.replace(/[{}]/g, "");
            href = href.replace(match, item[key] || "");
          });
        }
      }
      return (
        <Link href={href} className="font-medium hover:cursor-pointer text-[#1565c0] hover:underline">
          {value}
        </Link>
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
          {item.dialCode ? `${item.dialCode} ` : ""}{value || "-"}
        </span>
      );

    case "text":
    default:
      return <span>{value || "-"}</span>;
  }
}
