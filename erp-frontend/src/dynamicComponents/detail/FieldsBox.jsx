"use client";

import React from "react";
import DetailRow from "@/dynamicComponents/display/DetailRow";
import { FieldFormatter } from "@/dynamicComponents/display/FieldFormatter";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export default function FieldsBox({ config, data, onOpenDrawer }) {
  if (!config || !data) return null;

  const { title, icon, fieldLayout = { columns: 1 }, fields = [] } = config;
  const IconComponent = icon && LucideIcons[icon] ? LucideIcons[icon] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
          {IconComponent && <IconComponent className="w-4 h-4 text-gray-400" />}
          <h3 className={cn("text-sm  text-gray-600", config.classes?.title)}>{title}</h3>
        </div>
      )}

      <div className={`grid grid-cols-${fieldLayout.columns} gap-x-8`}>
        {fields.map((field, idx) => (
          <DetailRow
            key={field.key || idx}
            label={field.label}
            labelClassName={field.classes?.label}
            valueClassName={field.classes?.value}
            valueNode={<FieldFormatter field={field} rowData={data} onOpenDrawer={onOpenDrawer} />}
          />
        ))}
      </div>
    </div>
  );
}
