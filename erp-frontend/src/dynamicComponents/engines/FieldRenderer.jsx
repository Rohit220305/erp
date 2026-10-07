"use client";

import React from 'react';
import { useWatch } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { FormField } from '../forms/FormCompositions';
import { 
  TextInput, 
  NumberInput, 
  UnitInput,
  TextareaInput, 
  SelectInput,
  DateInput,
  ToggleInput,
  RadioGroupInput,
  SearchInput,
  FormattedNumericInput
} from '../inputs/FormInputs';
import { 
  AsyncSelectInput, 
  PhoneInput, 
  ImageUploadInput,
  PasswordInput,
  MultiSelectInput,
  FileUploadInput,
  DateRangeInput,
  MultiImageUploadInput
} from '../inputs/FormInputsAdvanced';

export const FieldRenderer = ({ fieldConfig, value, onChange, onBlur, error, disabled, mode, control, form }) => {
  const { user } = useAuth();
  
  const conditionField = fieldConfig.condition?.field;
  const watchedValue = useWatch({ control, name: conditionField, disabled: !conditionField });

  if (fieldConfig.superAdminOnly && !user?.isSuperAdmin) return null;

  if (conditionField) {
    const { operator, value: targetValue } = fieldConfig.condition;
    let isVisible = false;
    switch (operator) {
      case 'equal': isVisible = String(watchedValue) === String(targetValue); break;
      case 'notEqual': isVisible = String(watchedValue) !== String(targetValue); break;
      case 'in': isVisible = Array.isArray(targetValue) && targetValue.includes(watchedValue); break;
      case 'notEmpty': isVisible = !!watchedValue; break;
      default: isVisible = true;
    }
    if (!isVisible) return null;
  }

  const editOverrides = mode === 'edit' ? (fieldConfig.editProps || {}) : {};
  const finalDisabled = disabled || editOverrides.disabled || false;
  const finalReadOnly = editOverrides.readOnly || false;

  const { type, label, required, hint, info, action, classes = {}, props: extraProps = {} } = fieldConfig;
  const name = fieldConfig.key;

  let InputComponent;

  switch (type) {
    case 'text':
    case 'email':
      InputComponent = (
        <TextInput 
          type={type} 
          name={name}
          value={value} 
          onChange={onChange}
          onBlur={onBlur}
          error={error} 
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          {...extraProps} 
        />
      );
      break;
    case 'password':
      InputComponent = (
        <PasswordInput
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          {...extraProps}
        />
      );
      break;
    case 'number':
      InputComponent = (
        <FormattedNumericInput 
          name={name}
          value={value} 
          onChange={onChange}
          onBlur={onBlur}
          error={error} 
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          min={extraProps.min}
          max={extraProps.max}
          maxDecimals={extraProps.maxDecimals}
          {...extraProps} 
        />
      );
      break;
    case 'textarea':
      InputComponent = (
        <TextareaInput 
          name={name}
          value={value} 
          onChange={onChange}
          onBlur={onBlur}
          error={error} 
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          rows={extraProps.rows}
          {...extraProps} 
        />
      );
      break;
    case 'select':
      InputComponent = (
        <SelectInput 
          name={name}
          value={value} 
          onChange={onChange}
          options={extraProps.options || []}
          error={error} 
          disabled={finalDisabled}
          {...extraProps} 
        />
      );
      break;
    case 'async-select':
      InputComponent = (
        <AsyncSelectInput 
          name={name}
          value={value} 
          onChange={onChange}
          error={error} 
          disabled={finalDisabled}
          control={control}
          form={form}
          dependsOn={fieldConfig.dependsOn}
          filters={fieldConfig.filters}
          api={fieldConfig.api}
          labelKey={fieldConfig.labelKey}
          valueKey={fieldConfig.valueKey}
          {...extraProps} 
        />
      );
      break;
    case 'multi-select':
      InputComponent = (
        <MultiSelectInput 
          name={name}
          value={value} 
          onChange={onChange}
          options={extraProps.options || []}
          error={error} 
          disabled={finalDisabled}
          {...extraProps} 
        />
      );
      break;
    case 'date':
      InputComponent = (
        <DateInput 
          name={name}
          value={value} 
          onChange={onChange}
          onBlur={onBlur}
          error={error} 
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          {...extraProps} 
        />
      );
      break;
    case 'toggle':
      InputComponent = (
        <ToggleInput 
          name={name}
          value={value} 
          onChange={onChange}
          disabled={finalDisabled}
          {...extraProps} 
        />
      );
      break;
    case 'radio':
      InputComponent = (
        <RadioGroupInput 
          name={name}
          value={value} 
          onChange={onChange}
          options={extraProps.options || []}
          disabled={finalDisabled}
          {...extraProps} 
        />
      );
      break;
    case 'phone':
      InputComponent = (
        <PhoneInput 
          name={name}
          value={value} 
          onChange={onChange}
          onBlur={onBlur}
          error={error} 
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          {...extraProps} 
        />
      );
      break;
    case 'image-upload':
      InputComponent = (
        <ImageUploadInput 
          name={name}
          value={value} 
          onChange={onChange}
          error={error} 
          disabled={finalDisabled}
          {...extraProps} 
        />
      );
      break;
    case 'multi-image-upload':
      InputComponent = (
        <MultiImageUploadInput 
          name={name}
          value={value} 
          onChange={onChange}
          error={error} 
          disabled={finalDisabled}
          accept={extraProps.accept}
          {...extraProps} 
        />
      );
      break;
    case 'file-upload':
      InputComponent = (
        <FileUploadInput 
          name={name}
          value={value} 
          onChange={onChange}
          error={error} 
          disabled={finalDisabled}
          accept={extraProps.accept}
          {...extraProps} 
        />
      );
      break;
    default:
      InputComponent = (
        <TextInput 
          name={name}
          value={value} 
          onChange={onChange}
          onBlur={onBlur}
          error={error} 
          disabled={finalDisabled}
          readOnly={finalReadOnly}
          {...extraProps} 
        />
      );
  }

  return (
    <div className={fieldConfig.colSpan === 2 ? 'md:col-span-2' : ''}>
      <FormField 
        name={name}
        label={label} 
        required={required} 
        hint={hint} 
        info={info} 
        action={typeof action === 'function' ? action(form) : action} 
        error={error} 
        classes={classes}
      >
        {InputComponent}
      </FormField>
    </div>
  );
};
