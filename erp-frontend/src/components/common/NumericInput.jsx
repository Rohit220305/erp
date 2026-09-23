import React from "react";
import { addCommas, stripCommas } from "@/utils/number-formatter";

export default function NumericInput({
  value,
  onChange,
  onBlur,
  maxDecimals = 4,
  min,
  max,
  disabled = false,
  className = "",
  placeholder = "",
  ...rest
}) {
  const handleChange = (e) => {
    let raw = stripCommas(e.target.value);

    // Allow digits, one dot, and optional leading minus
    raw = raw.replace(/[^0-9.-]/g, "");

    const parts = raw.split(".");
    if (parts.length > 2) raw = parts[0] + "." + parts.slice(1).join("");

    if (parts[1] !== undefined) {
      raw = parts[0] + "." + parts[1].slice(0, maxDecimals);
    }

    if (raw && raw !== "-" && raw !== "." && !raw.endsWith(".")) {
      const num = Number(raw);
      if (!isNaN(num)) {
        if (max !== undefined && num > max) raw = String(max);
        if (min !== undefined && num < min && !raw.startsWith("-")) raw = String(min);
      }
    }

    onChange(raw);
  };

  const handleBlur = (e) => {
    let raw = stripCommas(e.target.value);

    if (raw === "-" || raw === ".") {
      raw = "";
    } else if (raw.endsWith(".")) {
      raw = raw.slice(0, -1);
    }

    if (raw) {
      const num = Number(raw);
      if (!isNaN(num)) {
        if (max !== undefined && num > max) raw = String(max);
        if (min !== undefined && num < min) raw = String(min);
      }
    }

    onChange(raw);

    if (onBlur) {
      const mockEvent = {
        ...e,
        target: { ...e.target, value: raw },
      };
      onBlur(mockEvent);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={addCommas(value ?? "")}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      autoComplete="off"
      {...rest}
    />
  );
}

