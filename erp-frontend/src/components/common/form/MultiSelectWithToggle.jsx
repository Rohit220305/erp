import React from "react";
import Select, { components } from "react-select";
import { ArrowLeft, ArrowRight } from "lucide-react";

const customSelectStyles = (error, disabled) => ({
  control: (base, state) => ({
    ...base,
    pointerEvents: "auto",
    borderColor: error ? "#f87171" : "#e5e7eb",
    borderRadius: "0.375rem",
    minHeight: "48px",
    backgroundColor: disabled ? "#f3f4f6" : "#f9fafb",
    boxShadow: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.875rem",
    "&:hover": {
      borderColor: disabled ? "#e5e7eb" : error ? "#f87171" : "#1565c0",
    },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "#1565c0"
      : state.isFocused
        ? "#eff6ff"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1f2937",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "0.25rem",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1d4ed8",
    fontSize: "0.75rem",
    fontWeight: "500",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#1d4ed8",
    ":hover": {
      backgroundColor: "#bfdbfe",
      color: "#1e3a8a",
    },
  }),
  placeholder: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "#9ca3af",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    transition: "all .2s ease",
    transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : null,
  }),
});

const CustomIndicatorsContainer = (props) => {
  const { selectProps } = props;
  const isAllSelected = selectProps.isAllSelected;

  return (
    <components.IndicatorsContainer {...props}>
      {!selectProps.isDisabled && selectProps.options.length > 0 && (
        <div
          className="flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors px-1"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            selectProps.handleToggleAll();
          }}
          title={isAllSelected ? "Deselect All" : "Select All"}
        >
          {isAllSelected ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
        </div>
      )}
      {props.children}
    </components.IndicatorsContainer>
  );
};

export default function MultiSelectWithToggle({
  value = [],
  onChange,
  options = [],
  error,
  disabled,
  placeholder = "Select options",
  instanceId = "multi-select-toggle",
  isLoading = false,
  noOptionsMessage,
}) {
  const isAllSelected = options.length > 0 && value?.length === options.length;

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const selectedOptions = value
    ? options.filter((opt) => value.includes(opt.value))
    : [];

  return (
    <div className="w-full">
      <Select
        instanceId={instanceId}
        isMulti
        value={selectedOptions}
        onChange={(selected) => {
          onChange(selected ? selected.map((s) => s.value) : []);
        }}
        options={options}
        isDisabled={disabled}
        isLoading={isLoading}
        isClearable={false} 
        isSearchable={true}
        placeholder={placeholder}
        noOptionsMessage={noOptionsMessage}
        classNamePrefix="react-select"
        isAllSelected={isAllSelected}
        handleToggleAll={handleToggleAll}
        components={{
          IndicatorsContainer: CustomIndicatorsContainer,
        }}
        styles={customSelectStyles(error, disabled)}
      />
    </div>
  );
}
