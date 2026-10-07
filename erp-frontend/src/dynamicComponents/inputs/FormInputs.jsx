"use client";

import React from 'react';
import Select from 'react-select';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import NumericInput from '@/components/common/NumericInput';

export const getInputClasses = (error, disabled, isReadOnly) => {
  const baseClasses =
    'w-full p-4 border rounded-lg text-sm transition outline-none focus:ring-2 focus:ring-[#1565c0]/20';
  
  if (disabled || isReadOnly) {
    return `${baseClasses} bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed`;
  }
  
  if (error) {
    return `${baseClasses} bg-white border-red-400`;
  }
  
  return `${baseClasses} bg-white border-gray-300 focus:border-[#1565c0]`;
};

export const customSelectStyles = (error, disabled) => ({
  control: (base) => ({
    ...base,
    borderColor: error ? '#f87171' : '#d1d5db',
    borderRadius: '0.5rem',
    minHeight: '56px',
    backgroundColor: disabled ? '#f9fafb' : '#ffffff',
    boxShadow: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.875rem',
    '&:hover': {
      borderColor: error ? '#f87171' : '#1565c0',
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? '#1565c0'
      : state.isFocused
      ? '#eff6ff'
      : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#1f2937',
  }),
  singleValue: (base, state) => ({
    ...base,
    fontSize: '0.875rem',
    color: state.isDisabled ? '#6b7280' : '#1f2937',
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: '0.875rem',
    color: '#9ca3af',
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    transition: 'all .2s ease',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
  }),
});

export const TextInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, className = '', type = 'text' }) => {
  return (
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(getInputClasses(error, disabled, readOnly), className)}
    />
  );
};

export const NumberInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, min, max, step, className = '' }) => {
  return (
    <input
      type="number"
      name={name}
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? '' : Number(val));
      }}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      min={min}
      max={max}
      step={step}
      className={cn(getInputClasses(error, disabled, readOnly), className)}
    />
  );
};

export const UnitInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, unit, min, max, step, className = '' }) => {
  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        type="number"
        name={name}
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? '' : Number(val));
        }}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        className={cn(getInputClasses(error, disabled, readOnly), "pr-12")} 
      />
      {unit && (
        <span className="absolute right-4 text-sm text-gray-500 font-medium select-none pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  );
};

export const TextareaInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, rows = 3, className = '' }) => {
  return (
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      className={cn(getInputClasses(error, disabled, readOnly), "resize-y", className)}
    />
  );
};

export const SelectInput = ({ name, value, onChange, options = [], placeholder, disabled, error, isClearable = true, className = '' }) => {
  
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <div className={cn(className)}>
      <Select
        instanceId={`select-${name}`}
        value={selectedOption}
        onChange={(opt) => onChange(opt ? opt.value : '')}
        options={options}
        isDisabled={disabled}
        isClearable={isClearable}
        placeholder={placeholder || 'Select...'}
        classNamePrefix="react-select"
        styles={customSelectStyles(error, disabled)}
      />
    </div>
  );
};

export const DateInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, className = '' }) => {
  return (
    <input
      type="date"
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={cn(getInputClasses(error, disabled, readOnly), className)}
    />
  );
};

export const ToggleInput = ({ name, value, onChange, disabled, className = '' }) => {
  const isChecked = !!value;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={() => onChange(!isChecked)}
      className={cn("relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#1565c0] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 ease-in-out", className)}
    >
      <span className="sr-only">Toggle {name}</span>
      <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md bg-white" />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out",
          isChecked ? 'bg-[#1565c0]' : 'bg-gray-200'
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out",
          isChecked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
};

export const RadioGroupInput = ({ name, value, onChange, options = [], disabled, className = '' }) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {options.map((opt, i) => {
        const isChecked = value === opt.value;
        return (
          <label key={i} className={`flex items-center space-x-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isChecked}
              disabled={disabled}
              onChange={() => onChange(opt.value)}
              className="h-4 w-4 border-gray-300 text-[#1565c0] focus:ring-[#1565c0]"
            />
            <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
};

export const SearchInput = ({ name, value, onChange, placeholder = "Search...", disabled, className = '' }) => {
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(getInputClasses(false, disabled, false), "pl-10")}
      />
    </div>
  );
};

export const FormattedNumericInput = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  readOnly,
  error,
  min,
  max,
  maxDecimals = 4,
  className = '',
}) => {
  return (
    <NumericInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled || readOnly}
      min={min}
      max={max}
      maxDecimals={maxDecimals}
      className={cn(getInputClasses(error, disabled, readOnly), className)}
      placeholder={placeholder || `Enter value`}
    />
  );
};

