"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Camera, UploadCloud, X, Info } from 'lucide-react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { getInputClasses, customSelectStyles } from './FormInputs';
import { Country } from 'country-state-city';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useWatch } from 'react-hook-form';

export const PasswordInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, className = '' }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={getInputClasses(error, disabled, readOnly)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled || readOnly}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 cursor-pointer"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const DIAL_CODE_OPTIONS = (() => {
  const seen = new Set();
  const allCountries = Country.getAllCountries();
  return allCountries.filter((c) => c.phonecode).reduce((acc, c) => {
    const val = `+${c.phonecode}`;
    if (!seen.has(val)) {
      seen.add(val);
      acc.push({ label: val, value: val });
    }
    return acc;
  }, []);
})();

export const PhoneInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, className = '' }) => {

  const code = value?.code || '+91';
  const number = value?.number || '';

  const handleCodeChange = (opt) => {
    onChange({ code: opt ? opt.value : '', number });
  };

  const handleNumberChange = (e) => {
    onChange({ code, number: e.target.value });
  };

  return (
    <div className={cn("flex gap-2", className)}>
      <div className="w-[140px] shrink-0">
        <Select
          instanceId={`select-${name}-code`}
          value={DIAL_CODE_OPTIONS.find((d) => d.value === code) || null}
          onChange={handleCodeChange}
          options={DIAL_CODE_OPTIONS}
          isDisabled={disabled || readOnly}
          isClearable={false}
          isSearchable={true}
          placeholder="Code"
          classNamePrefix="react-select"
          styles={customSelectStyles(error, disabled || readOnly)}
        />
      </div>
      <input
        type="text"
        placeholder={placeholder || 'Phone Number'}
        value={number}
        onChange={handleNumberChange}
        disabled={disabled}
        readOnly={readOnly}
        className={cn("flex-1", getInputClasses(error, disabled, readOnly))}
      />
    </div>
  );
};

export const ImageUploadInput = ({ name, value, onChange, disabled, error, className = '' }) => {
  const fileInputRef = useRef(null);

  const previewUrl = typeof value === 'string' ? value : value?.previewUrl;

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    onChange({
      file,
      previewUrl: URL.createObjectURL(file)
    });
  };

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="relative">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Upload Preview"
            className={`w-20 h-20 rounded-full object-cover border-2 ${error ? 'border-red-400' : 'border-gray-200'}`}
          />
        ) : (
          <div className={`w-20 h-20 rounded-full bg-blue-50 text-[#1565c0] flex items-center justify-center text-2xl font-bold border-2 ${error ? 'border-red-400' : 'border-blue-200'}`}>
            U
          </div>
        )}
        {!disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-[#1565c0] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#0f57a6] transition cursor-pointer"
            title="Upload Photo"
          >
            <Camera size={13} />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
          disabled={disabled}
        />
      </div>
      <div>
        <p className="font-medium text-gray-800">Profile Photo</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
        {value?.file && <p className="text-xs text-green-600 mt-1">{value.file.name}</p>}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
};

export const AsyncSelectInput = ({
  name, value, onChange, loadOptions, defaultOptions = false, placeholder, disabled,
  error, isClearable = true, isMulti = false, className = '',
  control, dependsOn, filters, api, labelKey = 'label', valueKey = 'value', form
}) => {

  const watchKeys = useMemo(() => Array.isArray(dependsOn) ? dependsOn : (dependsOn ? [dependsOn] : []), [dependsOn]);
  const watchedValues = useWatch({ control, name: watchKeys, disabled: watchKeys.length === 0 });

  const primaryDependsOn = watchKeys[0];
  const primaryWatchedValue = watchedValues ? (Array.isArray(watchedValues) ? watchedValues[0] : watchedValues) : undefined;

  const prevParentValue = useRef(primaryWatchedValue);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (value && typeof value !== 'object') {
      if (!selectedOption || String(selectedOption.value) !== String(value)) {
        const fetchOption = async () => {
          const hasMissingDependency = (filters || []).some(f => {
            if (f.matchField && watchKeys.includes(f.matchField)) {
              const idx = watchKeys.indexOf(f.matchField);
              const val = Array.isArray(watchedValues) ? watchedValues[idx] : watchedValues;
              return val === undefined || val === null || val === "";
            }
            return false;
          });

          if (hasMissingDependency) {
            return;
          }

          if (api) {
            try {
              const baseFilters = (filters || []).map(f => {
                let filterValue = f.value;
                if (f.matchField && watchKeys.includes(f.matchField)) {
                  const idx = watchKeys.indexOf(f.matchField);
                  filterValue = Array.isArray(watchedValues) ? watchedValues[idx] : watchedValues;
                }
                return { key: f.key, value: filterValue, operator: f.operator || 'equal' };
              });

              const fetchFilters = [...baseFilters, { key: valueKey, value: value, operator: 'equal' }];
              const res = await api({ page: 1, limit: 1, filters: fetchFilters });
              const item = (res?.settings?.data?.list || res?.data?.list || [])[0];
              if (item) {
                setSelectedOption({ label: item[labelKey], value: item[valueKey] });
              } else {
                setSelectedOption(null);
              }
            } catch (e) {
              console.error("Failed to fetch initial option for AsyncSelect:", e);
            }
          }
        };
        fetchOption();
      }
    } else if (typeof value === 'object') {
      setSelectedOption(value);
    } else {
      setSelectedOption(null);
    }
  }, [value, api, valueKey, labelKey, JSON.stringify(filters), JSON.stringify(watchedValues), watchKeys]);

  useEffect(() => {
    if (primaryDependsOn && prevParentValue.current !== primaryWatchedValue) {
      if (form && form.setValue) {
        form.setValue(name, "");
      }
      prevParentValue.current = primaryWatchedValue;
    }
  }, [primaryWatchedValue, primaryDependsOn, form, name]);

  const buildLoadOptions = useCallback(
    async (inputValue) => {
      if (!api) return [];

      const apiFilters = (filters || []).map(f => {
        let filterValue = f.value;
        if (f.matchField && watchKeys.includes(f.matchField)) {
          const idx = watchKeys.indexOf(f.matchField);
          filterValue = Array.isArray(watchedValues) ? watchedValues[idx] : watchedValues;
        } else if (primaryDependsOn && !f.value && !f.matchField) {
          // fallback to old behavior if no matchField is provided but dependsOn exists
          filterValue = primaryWatchedValue;
        }
        return {
          key: f.key,
          value: filterValue,
          operator: f.operator || "equal",
        };
      }).filter(f => f.value);

      try {
        const res = await api({ page: 1, limit: 50, filters: apiFilters, search: inputValue });
        const list = res?.settings?.data?.list || res?.data?.list || [];
        return list.map(item => ({
          label: item[labelKey],
          value: item[valueKey],
        }));
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    [api, filters, watchedValues, watchKeys, primaryWatchedValue, labelKey, valueKey, primaryDependsOn]
  );

  const timerRef = useRef(null);
  const debouncedLoadOptions = useCallback((inputValue) => new Promise((resolve) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const results = api ? await buildLoadOptions(inputValue) : await loadOptions(inputValue);
      resolve(results);
    }, 300);
  }), [api, buildLoadOptions, loadOptions]);

  const actualLoadOptions = (api || (loadOptions && primaryDependsOn)) ? debouncedLoadOptions : loadOptions;

  const isDisabled = disabled || (primaryDependsOn && !primaryWatchedValue);
  const finalPlaceholder = (primaryDependsOn && !primaryWatchedValue) ? "Select dependent field first" : (placeholder || 'Select...');

  return (
    <div className={cn(className)}>
      <AsyncSelect
        instanceId={`select-${name}`}
        cacheOptions
        defaultOptions={defaultOptions}
        noOptionsMessage={({ inputValue }) =>
          !inputValue || !inputValue.trim() ? "Type to search..." : "No results found"
        }
        loadOptions={actualLoadOptions}
        value={selectedOption}
        onChange={(opt) => {
          setSelectedOption(opt);
          onChange(opt ? opt.value : "");
        }}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isMulti={isMulti}
        placeholder={finalPlaceholder}
        classNamePrefix="react-select"
        styles={customSelectStyles(error, isDisabled)}
      />
    </div>
  );
};

export const MultiSelectInput = ({ name, value, onChange, options = [], placeholder, disabled, error, isClearable = true, className = '' }) => {

  const selectedOptions = Array.isArray(value)
    ? options.filter(opt => value.includes(opt.value))
    : [];

  return (
    <div className={cn(className)}>
      <Select
        instanceId={`select-${name}`}
        isMulti
        value={selectedOptions}
        onChange={(opts) => {
          const arr = opts || [];
          onChange(arr.map(o => o.value));
        }}
        options={options}
        isDisabled={disabled}
        isClearable={isClearable}
        placeholder={placeholder || 'Select multiple...'}
        classNamePrefix="react-select"
        styles={customSelectStyles(error, disabled)}
      />
    </div>
  );
};

export const FileUploadInput = ({ name, value, onChange, accept, disabled, error, className = '' }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`w-full p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${disabled ? 'bg-gray-50 border-gray-200 cursor-not-allowed' :
          error ? 'bg-red-50 border-red-300 hover:border-red-400' :
            'bg-gray-50 border-gray-300 hover:border-[#1565c0]'
          }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          disabled={disabled}
          className="hidden"
        />

        {value ? (
          <div className="flex items-center justify-between bg-white p-3 border rounded shadow-sm">
            <span className="text-sm font-medium text-gray-700 truncate">{value.name}</span>
            <button type="button" onClick={handleRemove} className="text-gray-400 hover:text-red-500 p-1">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 space-y-2">
            <UploadCloud size={24} className={error ? 'text-red-400' : 'text-gray-400'} />
            <div className="text-sm">
              <span className="font-semibold text-[#1565c0]">Click to upload</span> or drag and drop
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DateRangeInput = ({ name, value, onChange, placeholder, disabled, readOnly, error, className = '' }) => {
  const startDate = value?.startDate || '';
  const endDate = value?.endDate || '';

  const handleStartChange = (e) => {
    onChange({ startDate: e.target.value, endDate });
  };

  const handleEndChange = (e) => {
    onChange({ startDate, endDate: e.target.value });
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <input
        type="date"
        value={startDate}
        onChange={handleStartChange}
        disabled={disabled}
        readOnly={readOnly}
        className={getInputClasses(error, disabled, readOnly)}
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        value={endDate}
        onChange={handleEndChange}
        disabled={disabled}
        readOnly={readOnly}
        className={getInputClasses(error, disabled, readOnly)}
      />
    </div>
  );
};

export const MultiImageUploadInput = ({
  name,
  value,
  onChange,
  disabled,
  error,
  accept = "image/jpeg,image/jpg,image/png,image/webp",
  maxSize = 5 * 1024 * 1024,
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);

  const val = value || { existingImages: [], newFiles: [], newPreviews: [] };
  const existingImages = val.existingImages || [];
  const newFiles = val.newFiles || [];
  const newPreviews = val.newPreviews || [];

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (!accept.split(',').some(type => file.type === type || accept.includes('image/*'))) {
        toast.error(`${file.name} is not a valid image format`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds ${(maxSize / (1024 * 1024)).toFixed(1)}MB limit`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);

      intervalRef.current = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(intervalRef.current);
            onChange({
              existingImages,
              newFiles: [...newFiles, ...validFiles],
              newPreviews: [...newPreviews, ...validPreviews],
            });
            setIsUploading(false);
            return 0;
          }
          return prev + 20;
        });
      }, 200);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleRemoveExisting = (index) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    onChange({ existingImages: updated, newFiles, newPreviews });
  };

  const handleRemoveNew = (index) => {
    const updatedFiles = [...newFiles];
    const updatedPreviews = [...newPreviews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    onChange({ existingImages, newFiles: updatedFiles, newPreviews: updatedPreviews });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn("w-full p-4 border-2 border-dashed rounded-lg flex justify-between items-center cursor-pointer transition-colors",
          disabled || isUploading ? "bg-gray-50 border-gray-200 cursor-not-allowed" :
            error ? "bg-red-50 border-red-300 hover:border-red-400" :
              "border-[#1565c0] bg-white hover:bg-blue-50"
        )}
      >
        <span className="text-[#1565c0] font-medium text-sm">Choose Files</span>
        <div className="relative group flex items-center">
          <Info size={18} className="text-gray-400" />
          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-48 z-10">
            Allowed: {accept}<br />Max size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={handleFilesChange}
          disabled={disabled || isUploading}
        />
      </div>

      {isUploading && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[22px] bg-[#e0e0e0] rounded overflow-hidden relative">
            <div
              className="h-full bg-[#1565c0] transition-all duration-200 flex items-center justify-center text-xs text-white font-medium"
              style={{ width: `${uploadProgress}%` }}
            >
              {uploadProgress > 20 && `${uploadProgress}%`}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm font-medium text-[#1565c0] hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {(existingImages.length > 0 || newPreviews.length > 0) && (
        <div className="flex flex-wrap gap-4 mt-4">
          {existingImages.map((img, idx) => (
            <div key={`existing-${idx}`} className="relative group">
              <img
                src={img.url || img}
                alt="Existing"
                className={cn("w-[84px] h-[64px] object-cover rounded border shadow-sm", idx === 0 && newPreviews.length === 0 ? "border-blue-500 border-2" : "border-gray-200")}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(idx)}
                  className="absolute -top-2.5 -right-2.5 bg-gray-400 hover:bg-gray-600 text-white rounded-full p-0.5 z-10"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          {newPreviews.map((img, idx) => (
            <div key={`new-${idx}`} className="relative group">
              <img
                src={img}
                alt="New"
                className={cn("w-[84px] h-[64px] object-cover rounded border shadow-sm", idx === 0 && existingImages.length === 0 ? "border-blue-500 border-2" : "border-gray-200")}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveNew(idx)}
                  className="absolute -top-2.5 -right-2.5 bg-gray-400 hover:bg-gray-600 text-white rounded-full p-0.5 z-10"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
