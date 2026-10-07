"use client";

import React from 'react';
import { StatusBadge } from './DataDisplay';
import { displayFormat } from '@/utils/no-data-formatter';
import ModuleLink from '@/components/common/ModuleLink';
import { useAuth } from '@/context/AuthContext';
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { Package } from "lucide-react";

export const FieldFormatter = ({ field, rowData, onOpenDrawer }) => {
  const { user } = useAuth();
  
  if (field.condition && !field.condition(rowData)) {
    return null;
  }
  
  if (field.showForSuperAdminOnly && user?.role !== 'SUPER_ADMIN') {
    return null;
  }
  
  let value = rowData[field.key];
  if (value === undefined && field.keys) {
      value = null;
  }

  switch (field.type) {
    case 'statusBadge':
      return <StatusBadge status={value} className={field.className} variant={field.variant} />;
      
    case 'image':
      return (
        <SharedImageZoom
          id={`${field.key}-${rowData.id || Math.random()}`}
          src={value}
          alt={rowData[field.altKey || 'name'] || 'Image'}
          placeholderText={<Package size={18} />}
          thumbnailClassName="w-10 h-10 rounded-lg border border-gray-200 shrink-0"
          className={field.className}
        />
      );

    case 'compositeText':
      if (field.keys && field.separator) {
        return <span className={field.className}>{field.keys.map(k => rowData[k]).filter(Boolean).join(field.separator)}</span>;
      }
      return <span className={field.className}>{displayFormat(value)}</span>;
      
    case 'date':
      return <span className={field.className}>{displayFormat(value, "DATE")}</span>;
      
    case 'reference': {
      const linkId = field.idKey ? rowData[field.idKey] : value;
      return (
        <ModuleLink
          moduleName={field.referenceModule}
          id={linkId}
          onOpenDrawer={onOpenDrawer ? () => onOpenDrawer(rowData) : undefined}
          className={field.className || "font-medium text-[#1565c0] hover:underline"}
        >
          {rowData[field.labelKey || field.key] || value}
        </ModuleLink>
      );
    }
      
    case 'text':
    default:
      return <span className={field.className}>{displayFormat(value)}</span>;
  }
};
