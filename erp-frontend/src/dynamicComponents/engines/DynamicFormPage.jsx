"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateZodSchema } from '../utils/generateZodSchema';
import { FormSection, FormGrid, FormActions } from '../forms/FormCompositions';
import { FieldRenderer } from './FieldRenderer';
import { getModule } from '@/config/modules';
import { useHeader } from '@/context/HeaderContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { buildRoute } from '@/lib/navigation/routeBuilder';
import ConfirmModal from '@/components/common/ConfirmModal';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

export const DynamicFormPage = ({ 
  moduleSlug, 
  mode = 'create', 
  entityId = null 
}) => {
  const router = useRouter();
  const { setConfig, resetConfig } = useHeader();
  const { user } = useAuth();
  
  const moduleConfig = getModule(moduleSlug);

  const [isLoading, setIsLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null, payload: null });


  if (moduleConfig?.form?.type === 'custom' && moduleConfig.form.component) {
    const CustomForm = moduleConfig.form.component;
    return <CustomForm mode={mode} entityId={entityId} />;
  }

  const sections = moduleConfig?.form?.sections || [];
  const allFields = sections.flatMap(s => s.fields || []);
  const schema = generateZodSchema(allFields, { isSuperAdmin: user?.isSuperAdmin, mode });
  
  const defaultValues = {};
  allFields.forEach(field => {
    if (field.key === 'companyId' && !user?.isSuperAdmin) {
      defaultValues[field.key] = user?.companyId || '';
    } else {
      defaultValues[field.key] = field.defaultValue ?? '';
    }
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  });
  const { control, handleSubmit, reset, formState: { errors, isDirty }, getValues, setValue, trigger } = form;

  useEffect(() => {
    if (mode === 'edit' && entityId && moduleConfig?.api?.getOne) {
      setIsLoading(true);
      moduleConfig.api.getOne(entityId).then(data => {
        const resetData = { ...defaultValues };
        Object.keys(defaultValues).forEach(key => {
          if (data[key] !== undefined) resetData[key] = data[key];
        });

        allFields.forEach(f => {
          if (f.type === 'multi-image-upload' && f.imageDataKey && data[f.imageDataKey]) {
            resetData[f.key] = {
              existingImages: data[f.imageDataKey] || [],
              newFiles: [],
              newPreviews: [],
            };
          }
        });
        reset(resetData);
      }).catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [mode, entityId]);

  useEffect(() => {
    const formHeader = moduleConfig?.form?.header || {};
    const titleMap = formHeader.title || {};
    const title = mode === 'create' 
      ? (titleMap.create || `Add ${moduleConfig.identity.moduleName}`) 
      : (titleMap.edit || `Edit ${moduleConfig.identity.moduleName}`);
    
    const breadcrumbs = (formHeader.breadcrumbs || []).map(b => ({
      label: typeof b.label === 'object' ? (b.label[mode] || b.label.create) : b.label,
      href: b.route ? buildRoute(b.route.module, b.route.action) : b.href,
    }));
    breadcrumbs.push({ label: mode === 'create' ? 'Add' : 'Edit' });

    setConfig({
      header: { actionButton: null, showProfile: true, showMenu: true },
      navbar: { title, breadcrumbs },
    });
    return () => resetConfig();
  }, [mode, moduleConfig]);

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const el = document.getElementById(`field-${errorKeys[0]}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors]);

  const handleActualSubmit = async (data) => {
    setIsLoading(true);
    try {
      const submitConfig = moduleConfig?.form?.submit || {};
      let payload = data;
      
      const hasMultiImage = allFields.some(f => f.type === 'multi-image-upload');
      if (submitConfig.submitType === 'formData' || hasMultiImage) {
        payload = new FormData();
        Object.keys(data).forEach(key => {
          const fieldConf = allFields.find(f => f.key === key);
          if (fieldConf?.type === 'multi-image-upload') {
            const val = data[key];
            if (val) {
              if (val.existingImages) {
                payload.append('existingImages', JSON.stringify(val.existingImages));
              }
              if (val.newFiles) {
                val.newFiles.forEach(f => payload.append(fieldConf.imageDataKey || key, f));
              }
            }
          } else if (fieldConf?.type === 'image-upload' || fieldConf?.type === 'file-upload') {
             if (data[key]?.file) {
               payload.append(key, data[key].file);
             } else if (data[key] && typeof data[key] !== 'object') {
               payload.append(key, data[key]);
             }
          } else {
             const val = data[key];
             if (val !== undefined && val !== null) {
               payload.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
             }
          }
        });
      }

      let response;
      if (mode === 'create' && moduleConfig.api.create) {
        response = await moduleConfig.api.create(payload);
      } else if (mode === 'edit' && moduleConfig.api.update) {
        response = await moduleConfig.api.update(entityId, payload);
      }

      const isSuccess = response?.success === 1 || response?.settings?.success === 1;
      if (isSuccess) {
        toast.success(submitConfig.successMessage?.[mode] || 'Successfully saved!');
        if (submitConfig.redirectTo) {
          router.push(buildRoute(submitConfig.redirectTo.module, submitConfig.redirectTo.action));
        } else {
          router.back();
        }
      } else {
        toast.error(response?.message || response?.settings?.message || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while saving.');
    } finally {
      setIsLoading(false);
      setModalConfig({ isOpen: false, type: null, payload: null });
    }
  };

  const onFormSubmit = (data) => {
    setModalConfig({ isOpen: true, type: mode === 'create' ? 'create' : 'update', payload: data });
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setModalConfig({ isOpen: true, type: 'discard', payload: null });
    } else {
      doDiscard();
    }
  };

  const doDiscard = () => {
    const submitConfig = moduleConfig?.form?.submit || {};
    if (submitConfig.redirectTo) {
      router.push(buildRoute(submitConfig.redirectTo.module, submitConfig.redirectTo.action));
    } else {
      router.back();
    }
  };

  if (!moduleConfig || !moduleConfig.form) return null;

  return (
    <div className="pt-6 h-full overflow-y-auto pb-20 mx-6 relative">
      {isLoading && <Loader overlay />}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 text-black">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          {sections.map((section, idx) => (
            <FormSection key={idx} title={section.title} description={section.description}>
              <FormGrid cols={section.grid?.cols || 2}>
                {section.fields.map(field => (
                  <Controller
                    key={field.key}
                    name={field.key}
                    control={control}
                    render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                      <FieldRenderer
                        fieldConfig={field}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        error={error?.message}
                        disabled={isLoading}
                        mode={mode}
                        control={control}
                        form={form}
                      />
                    )}
                  />
                ))}
              </FormGrid>
            </FormSection>
          ))}
        </div>
        <div className="flex justify-center gap-10 py-15">
          <button 
            type="button" 
            onClick={handleCancelClick} 
            className="px-6 py-2.5 border border-gray-300 bg-white rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100 cursor-pointer min-w-[120px]"
          >
            {moduleConfig?.form?.submit?.cancelLabel || 'Discard'}
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 disabled:opacity-60 cursor-pointer min-w-[120px]"
          >
            {isLoading 
              ? (moduleConfig?.form?.submit?.loadingLabel?.[mode] || moduleConfig?.form?.submit?.loadingLabel || 'Saving...')
              : (moduleConfig?.form?.submit?.submitLabel?.[mode] || moduleConfig?.form?.submit?.submitLabel || (mode === 'create' ? 'Submit' : 'Save'))}
          </button>
        </div>
      </form>
      
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={
          modalConfig.type === 'discard' ? 'Discard Changes?' :
          modalConfig.type === 'create' ? `Create ${moduleConfig.form.submit?.entityName || 'Record'}?` :
          `Update ${moduleConfig.form.submit?.entityName || 'Record'}?`
        }
        message={
          modalConfig.type === 'discard' ? 'Are you sure you want to discard?' :
          modalConfig.type === 'create' ? 'Are you sure you want to save this new record?' :
          'Are you sure you want to save these changes?'
        }
        confirmText={
          modalConfig.type === 'discard' ? 'Discard' :
          'Confirm'
        }
        cancelText="Cancel"
        onConfirm={() => {
          if (modalConfig.type === 'discard') {
            doDiscard();
          } else {
            handleActualSubmit(modalConfig.payload);
          }
        }}
        onCancel={() => setModalConfig({ isOpen: false, type: null, payload: null })}
        variant={modalConfig.type === 'discard' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default DynamicFormPage;
