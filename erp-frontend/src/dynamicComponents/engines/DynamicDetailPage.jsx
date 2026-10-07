"use client";

import React, { useEffect, useState } from 'react';
import { getModule } from '@/config/modules';
import { useHeader } from '@/context/HeaderContext';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { buildRoute } from '@/lib/navigation/routeBuilder';
import SideDrawer from '@/components/common/SideDrawer';
import DetailSidebar from '../detail/DetailSidebar';
import BoxRenderer from '../detail/BoxRenderer';

function resolveTabsFromConfig(detailPage) {
  if (detailPage?.tabs?.length) return detailPage.tabs;

  if (detailPage?.content?.cards) {
    return [{
      id: "summary",
      label: "Summary",
      icon: "FileText",
      isDefault: true,
      layout: { columns: 3 },
      boxes: detailPage.content.cards.map((card, idx) => ({
        id: card.title?.toLowerCase().replace(/\s+/g, '_') || `card_${idx}`,
        type: card.type || "fields",
        title: card.title,
        colSpan: card.type === "audit" ? 1 : 2,
        fields: card.fields,
      }))
    }];
  }

  return [{ id: "summary", label: "Summary", isDefault: true, boxes: [] }];
}

export const DynamicDetailPage = ({ moduleSlug, entityId }) => {
  const moduleConfig = getModule(moduleSlug);
  const { setConfig, resetConfig } = useHeader();
  
  if (moduleConfig?.detailPage?.type === "custom" && moduleConfig.detailPage.component) {
    const CustomDetail = moduleConfig.detailPage.component;
    return <CustomDetail entityId={entityId} />;
  }

  const [entityData, setEntityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntity = async () => {
      if (entityId && moduleConfig?.api?.getOne) {
        try {
          setIsLoading(true);
          const data = await moduleConfig.api.getOne(entityId);
          setEntityData(data);
        } catch (error) {
          console.error("Failed to load entity data", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchEntity();
  }, [entityId, moduleConfig]);

  useEffect(() => {
    const configHeader = moduleConfig?.detailPage?.header || {};
    
    const mappedBreadcrumbs = (configHeader.breadcrumbs || []).map(b => ({
      label: b.label,
      href: b.route ? buildRoute(b.route.module, b.route.action, b.route.params || { id: entityId }) : b.href
    }));

    const mappedActions = (configHeader.actions || []).map(a => ({
      label: a.label,
      className: a.className,
      href: a.route ? buildRoute(a.route.module, a.route.action, a.route.params || { id: entityId }) : a.href,
      onClick: a.onClick,
    }));

    setConfig({ 
      header: { 
        actionButton: null,
        showProfile: true,
        showMenu: true,
      },
      navbar: {
        title: configHeader.title || "",
        breadcrumbs: mappedBreadcrumbs,
        actionButtons: mappedActions,
      }
    });
    return () => resetConfig();
  }, [moduleConfig, entityId, setConfig, resetConfig]);

  const tabs = resolveTabsFromConfig(moduleConfig?.detailPage);

  const { activeTab, getTabHref } = useTabNavigation({
    moduleKey: moduleConfig?.identity?.slug || moduleSlug,
    entityId,
    defaultTab: tabs.find(t => t.isDefault)?.id || tabs[0]?.id || "summary",
    validTabs: tabs.map(t => t.id),
  });

  const [drawerState, setDrawerState] = useState({ isOpen: false, moduleName: null, id: null });
  const handleOpenDrawer = (moduleName, id) => {
    setDrawerState({ isOpen: true, moduleName, id });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading details...</p>
      </div>
    );
  }

  if (!entityData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Failed to load data.</p>
      </div>
    );
  }

  const activeTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];
  const sidebarWidth = moduleConfig?.detailPage?.sidebar?.width || 2;

  return (
    <div className="h-full">
      <div className="grid grid-cols-12 gap-6 h-full ps-10 pt-2">
        <div className={`col-span-${sidebarWidth}`}>
          <DetailSidebar
            config={moduleConfig?.detailPage?.sidebar}
            entityData={entityData}
            tabs={tabs}
            activeTab={activeTab}
            getTabHref={getTabHref}
            sidebarWidth={sidebarWidth}
          />
        </div>

        <div className={`col-span-${12 - sidebarWidth} overflow-y-scroll h-full pe-10 pb-20`}>
          {activeTabConfig?.customComponent ? (
            React.createElement(activeTabConfig.customComponent, { entityData, onOpenDrawer: handleOpenDrawer })
          ) : (
            <div className={`grid grid-cols-${activeTabConfig?.layout?.columns || 3} gap-6`}>
              {activeTabConfig?.boxes?.map(box => (
                <div key={box.id} className={`col-span-${box.colSpan || 1}`}>
                  <BoxRenderer
                    box={box}
                    entityData={entityData}
                    onOpenDrawer={handleOpenDrawer}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SideDrawer
        open={drawerState.isOpen}
        onClose={() => setDrawerState({ isOpen: false, moduleName: null, id: null })}
        moduleName={drawerState.moduleName}
        mode="details"
        data={drawerState.id ? { id: drawerState.id } : null}
      />
    </div>
  );
};

export default DynamicDetailPage;
