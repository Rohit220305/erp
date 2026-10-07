"use client";

import React from "react";
import { AvatarInitials } from "@/dynamicComponents/display/DataDisplay";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";

export default function AuditCard({ data, variant = "stacked", onOpenDrawer }) {
  if (!data) return null;

  const {
    addedByName,
    addedDateFormatted,
    addedBy,
    updatedByName,
    updatedDateFormatted,
    updatedBy
  } = data;

  const renderUser = (label, name, date, id) => (
    <div className="flex items-center gap-4">
      <AvatarInitials name={name || "NA"} size="md" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        {name ? (
          <ModuleLink
            moduleName="user"
            id={id}
            onOpenDrawer={() => onOpenDrawer && onOpenDrawer("user", id)}
          >
            {name}
          </ModuleLink>
        ) : (
          <span className="text-sm font-medium text-gray-900">System</span>
        )}
        <span className="text-xs text-gray-400 mt-0.5">{displayFormat(date, "DATE")}</span>
      </div>
    </div>
  );

  if (variant === "split") {
    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {renderUser("Added By", addedByName, addedDateFormatted, addedBy)}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          {renderUser("Updated By", updatedByName, updatedDateFormatted, updatedBy)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-6">
      {renderUser("Added By", addedByName, addedDateFormatted, addedBy)}
      <hr className="border-gray-50" />
      {renderUser("Updated By", updatedByName, updatedDateFormatted, updatedBy)}
    </div>
  );
}
