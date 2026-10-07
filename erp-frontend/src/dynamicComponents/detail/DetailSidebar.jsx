"use client";

import React from "react";
import Link from "next/link";
import { StatusBadge } from "@/dynamicComponents/display/DataDisplay";
import { useAuth } from "@/context/AuthContext";
import * as LucideIcons from "lucide-react";

export default function DetailSidebar({
  config,
  entityData,
  tabs,
  activeTab,
  getTabHref,
  sidebarWidth = 2,
}) {
  const { can } = useAuth();
  if (!config || !entityData) return null;

  const { identity } = config;
  
  const title = identity?.title?.key ? entityData[identity.title.key] : "";
  const subtitle = identity?.subtitle?.key ? entityData[identity.subtitle.key] : "";
  const badgeStatus = identity?.badge?.key ? entityData[identity.badge.key] : "";

  return (
    <div className="bg-white rounded-xl hover:shadow-lg transition p-5 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-base text-gray-900 font-medium">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {badgeStatus && (
          <div className="mt-3">
            <StatusBadge 
              status={badgeStatus} 
              variant={identity?.badge?.variant}
              className={identity?.badge?.className}
            />
          </div>
        )}
      </div>

      <hr className="my-2 border-gray-100" />

      <div className="space-y-1 mt-4">
        {tabs?.map((tab) => {
          if (tab.permission && !can(tab.permission)) return null;

          const isActive = tab.id === activeTab;
          const IconComponent = tab.icon && LucideIcons[tab.icon] ? LucideIcons[tab.icon] : null;

          return (
            <Link
              key={tab.id}
              href={getTabHref(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#1565c0] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100/70"
              }`}
            >
              {IconComponent && (
                <IconComponent 
                  size={16} 
                  className={isActive ? "text-white" : "text-gray-500"} 
                />
              )}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
