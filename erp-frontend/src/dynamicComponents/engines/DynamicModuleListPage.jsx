"use client";

import React from 'react';
import DynamicListing from '@/components/common/dynamic/DynamicListing';
import { getModule } from '@/config/modules';
import { FieldFormatter } from '../display/FieldFormatter';
import ActionRenderer from '@/components/core/dynamic-ui/ActionRenderer';
import { useAuth } from '@/context/AuthContext';

export const DynamicModuleListPage = ({ 
  moduleSlug, 
  extraApiParams, 
  extraNavButtons 
}) => {
  const { user } = useAuth();
  const moduleConfig = getModule(moduleSlug);
  if (!moduleConfig) return null;

  const moduleName = moduleConfig.identity?.moduleName || moduleSlug;
  const schema = {
    title: moduleName,
    moduleName: moduleName,
    modulePath: moduleConfig.list?.path || `/${moduleSlug.toLowerCase().replace(/\s+/g, '-')}`,
    parentModule: moduleConfig.menu?.category || moduleConfig.parentModule || 'Master',

    permissions: moduleConfig.permissions || {},

    actions: moduleConfig.list?.actions || {},
    primaryAction: moduleConfig.list?.primaryAction || (
      moduleConfig.surfaces?.detailMode === 'page'
        ? { type: 'page', path: moduleConfig.list?.detailPath || `/${moduleSlug.toLowerCase()}/details/{id}` }
        : { type: 'drawer' }
    ),

    columns: (moduleConfig.list?.tableView?.columns || moduleConfig.list?.columns || []).filter(
      (c) => !(c.showForSuperAdminOnly && !user?.isSuperAdmin)
    ),
    forceView: moduleConfig.list?.forceView,
    headerIcons: moduleConfig.list?.headerIcons,

    defaultFilters: moduleConfig.list?.defaultFilters,
    sidebarFields: moduleConfig.list?.sidebarFields,
    searchFields: moduleConfig.list?.searchFields,
    sidebarStatuses: moduleConfig.list?.sidebarStatuses,
    listCard: moduleConfig.list?.listView || moduleConfig.list?.listCard,
    gridCard: moduleConfig.list?.gridView || moduleConfig.list?.gridCard,
  };

  const surfaces = moduleConfig.surfaces || { hasTable: true, hasGrid: false, hasList: false };
  const viewCount = [surfaces.hasTable, surfaces.hasGrid, surfaces.hasList].filter(Boolean).length;
  
  if (!schema.headerIcons) {
    schema.headerIcons = schema.defaultFilters 
      ? ["refresh", "search", "filter", "filterDrawer"] 
      : ["refresh", "search", "filter"];
    
    if (viewCount > 1) {
      schema.headerIcons.push("view");
    }
  }

  const handleRenderTableRow = (record, onRowAction, setSelectedItemForDetails) => (
    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
      {schema.columns.map((col, colIndex) => (
        <td key={colIndex} className="px-4 py-3 text-sm whitespace-nowrap">
          {col.type === 'actions' ? (
            <ActionRenderer
              item={record}
              actions={schema.actions?.row || []}
              onActionClick={onRowAction}
            />
          ) : (
            <FieldFormatter 
              field={col} 
              rowData={record} 
              onOpenDrawer={
                col.type === 'reference' && col.referenceModule !== moduleSlug
                  ? undefined
                  : setSelectedItemForDetails
              } 
            />
          )}
        </td>
      ))}
    </tr>
  );

  return (
    <DynamicListing 
      schema={schema}
      fetchData={moduleConfig.api?.list}
      fetchItem={moduleConfig.api?.getOne}
      deleteFn={moduleConfig.api?.delete}
      renderTableRow={moduleConfig.list?.renderTableRow || handleRenderTableRow}
      renderListCard={moduleConfig.list?.renderListCard}
      renderGridCard={moduleConfig.list?.renderGridCard}
      extraApiParams={extraApiParams}
      extraNavButtons={extraNavButtons}
    />
  );
};

export default DynamicModuleListPage;
