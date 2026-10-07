"use client";

import React from "react";
import { AvatarInitials } from "@/dynamicComponents/display/DataDisplay";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import ModuleLink from "@/components/common/ModuleLink";
import { displayFormat } from "@/utils/no-data-formatter";
import { getNestedValue } from "@/dynamicComponents/utils/detailUtils";

export default function AuditUserCard({ box, entityData, onOpenDrawer }) {
  if (!box || !entityData) return null;

  const { title, fields, userIdKey, imageKey } = box;


  const userLinkField = fields?.find(f => f.type === "userLink");
  const dateField = fields?.find(f => f.type === "date");


  const userId = userIdKey ? getNestedValue(entityData, userIdKey) : null;
  const userName = userLinkField?.key ? getNestedValue(entityData, userLinkField.key) : null;
  const dateValue = dateField?.key ? getNestedValue(entityData, dateField.key) : null;
  const imageUrl = imageKey ? getNestedValue(entityData, imageKey) : null;

  if (!userId && !userName) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {title && <h4 className="text-sm text-gray-500 tracking-wider mb-3">{title}</h4>}
      
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <SharedImageZoom
            id={`audit-user-${userId || box.id}`}
            src={imageUrl}
            alt={userName || "User Image"}
            thumbnailClassName="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <AvatarInitials name={userName || "NA"} size="md" />
        )}

        <div className="flex flex-col">
          {userName ? (
            <ModuleLink
              moduleName="user"
              id={userId}
              onOpenDrawer={() => onOpenDrawer && userId && onOpenDrawer("user", userId)}
              className="text-sm font-medium text-[#1565c0] hover:underline cursor-pointer"
            >
              {userName}
            </ModuleLink>
          ) : (
            <span className="text-sm font-medium text-gray-900">System</span>
          )}
          
          {dateValue && (
            <span className="text-xs text-gray-400 mt-0.5">
              {displayFormat(dateValue, "DATE")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
