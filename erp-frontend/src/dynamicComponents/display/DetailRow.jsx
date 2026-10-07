"use client";

import React from "react";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";
import { cn } from "@/lib/utils";

export default function DetailRow({ label, value, valueNode, href, onClick, valueClassName = "", labelClassName = "" }) {
  if (value === undefined && value === null && !valueNode) {
    return null;
  }

  return (
    <div className="flex justify-between py-3 border-b border-gray-50 last:border-0">
      <span className={cn("text-sm text-gray-500", labelClassName)}>{label}</span>
      <div className={cn("text-sm font-medium text-right text-gray-900", valueClassName)}>
        {valueNode ? (
          valueNode
        ) : href || onClick ? (
          <ModuleLink href={href} onClick={onClick}>
            {displayFormat(value)}
          </ModuleLink>
        ) : (
          displayFormat(value)
        )}
      </div>
    </div>
  );
}
