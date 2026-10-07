"use client";

import React from 'react';
import { PrimaryButton, SecondaryButton } from '../buttons/Buttons';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

export const FormField = ({ name, label, required, error, hint, info, action, classes = {}, children, className = '' }) => {
  return (
    <div id={`field-${name}`} className={cn("space-y-1.5", className)}>
      {label && (
        <label className={cn("block text-xs font-semibold text-gray-500 tracking-wide", classes.label)}>
          {label} {required && <span className="text-red-400 ml-1">*</span>}
          {info && (
            <span className="relative group inline-block ml-1.5 align-middle">
              <Info size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer transition" />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-[#1565c0] text-white text-xs rounded shadow-lg z-20 whitespace-nowrap p-2">
                {info}
              </span>
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        {children}
        {action && <div className="absolute right-3 top-1/2 -translate-y-1/2">{action}</div>}
      </div>
      
      {error && (
        <p className={cn("text-xs text-red-500 mt-1", classes.error)}>{error}</p>
      )}
      {!error && hint && (
        <p className="text-xs text-gray-500 mt-1">{hint}</p>
      )}
    </div>
  );
};

export const FormGrid = ({ cols = 2, children, className = '' }) => {
  const getGridColsClass = () => {
    switch (cols) {
      case 1: return 'grid-cols-1';
      case 3: return 'md:grid-cols-3';
      case 2:
      default: return 'md:grid-cols-2';
    }
  };

  return (
    <div className={cn(`grid ${getGridColsClass()} gap-x-16 gap-y-6`, className)}>
      {children}
    </div>
  );
};

export const FormSection = ({ title, description, divider = true, children, className = '' }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {(title || description) && (
        <div className={divider ? 'border-b border-gray-100 pb-3' : 'pb-1'}>
          {title && <h2 className="text-base font-semibold text-gray-800">{title}</h2>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export const FormActions = ({ 
  loading, 
  submitLabel = 'Submit', 
  onSubmit, 
  discardLabel = 'Cancel', 
  onDiscard,
  multiStep = false,
  onNext,
  onBack,
  align = 'center',
  className = ''
}) => {
  const getAlignClass = () => {
    switch (align) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      case 'center':
      default: return 'justify-center';
    }
  };

  return (
    <div className={cn(`flex gap-3 border-t border-gray-100 pt-4 mt-8 ${getAlignClass()}`, className)}>
      {multiStep ? (
        <>
          {onBack && (
            <SecondaryButton onClick={onBack} disabled={loading}>
              Back
            </SecondaryButton>
          )}
          {onNext && (
            <PrimaryButton onClick={onNext} loading={loading}>
              Next
            </PrimaryButton>
          )}
        </>
      ) : (
        <>
          {onDiscard && (
            <SecondaryButton onClick={onDiscard} disabled={loading}>
              {discardLabel}
            </SecondaryButton>
          )}
          {onSubmit && (
            <PrimaryButton onClick={onSubmit} loading={loading}>
              {submitLabel}
            </PrimaryButton>
          )}
        </>
      )}
    </div>
  );
};
