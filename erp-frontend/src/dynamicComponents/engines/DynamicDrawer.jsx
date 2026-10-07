"use client";

import React from 'react';
import { DrawerShell, DrawerSection } from '../drawers/DrawerCompositions';
import { DynamicFormPage } from './DynamicFormPage';
import { DataLabel } from '../display/DataDisplay';

const DrawerDetailsView = ({ moduleConfig, entityId }) => {
  const [entityData, setEntityData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
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

  if (isLoading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (!entityData) return <div className="p-6 text-red-500">Error loading data.</div>;

  return (
    <div className="space-y-6">
      {moduleConfig.detailPage?.sections?.map((section, idx) => (
        <DrawerSection key={idx} title={section.title}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.fields?.map((field, fIdx) => (
              <div key={fIdx} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                <DataLabel 
                  label={field.label} 
                  value={entityData[field.key]} 
                  displayType={field.displayType} 
                />
              </div>
            ))}
          </div>
        </DrawerSection>
      ))}
    </div>
  );
};

export const DynamicDrawer = ({ moduleConfig, mode = 'details', entityId, isOpen, onClose }) => {
  if (!moduleConfig) return null;
  
  const moduleName = moduleConfig.identity?.moduleName || 'Module';
  const title = mode === 'create' 
    ? `Create ${moduleName}` 
    : mode === 'edit' 
      ? `Edit ${moduleName}` 
      : `${moduleName} Details`;

  return (
    <DrawerShell isOpen={isOpen} onClose={onClose} title={title}>
      {mode === 'details' ? (
        <DrawerDetailsView moduleConfig={moduleConfig} entityId={entityId} />
      ) : (
        <DynamicFormPage 
          moduleSlug={moduleConfig.identity?.slug} 
          mode={mode} 
          entityId={entityId} 
          onCancel={onClose}
          onSubmit={async (data) => {
            
            if (moduleConfig.api) {
              if (mode === 'create' && moduleConfig.api.create) {
                await moduleConfig.api.create(data);
              } else if (mode === 'edit' && moduleConfig.api.update) {
                await moduleConfig.api.update(entityId, data);
              }
              onClose();
            }
          }}
        />
      )}
    </DrawerShell>
  );
};

export default DynamicDrawer;
