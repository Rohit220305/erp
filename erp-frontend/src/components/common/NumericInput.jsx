import React, { useState, useRef, useCallback } from "react";
import { addCommas, stripCommas } from "@/utils/number-formatter";

export default function NumericInput({
  value,
  onChange,
  maxDecimals = 4,
  min,
  max,
  disabled = false,
  className = "",
  placeholder = "",
  ...rest
}) {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused
    ? addCommas(value === null || value === undefined ? "" : String(value))
    : addCommas(value === null || value === undefined ? "" : String(value));

  const handleChange = useCallback(
    (e) => {
      const el = e.target;
      const cursorPos = el.selectionStart;
      const oldVal = el.value;

      let raw = stripCommas(oldVal.substring(0, cursorPos)) + stripCommas(oldVal.substring(cursorPos));
      raw = stripCommas(e.target.value);

      raw = raw.replace(/[^0-9.\-]/g, "");

      const dotIndex = raw.indexOf(".");
      if (dotIndex !== -1) {
        raw = raw.substring(0, dotIndex + 1) + raw.substring(dotIndex + 1).replace(/\./g, "");
      }

      if (raw.indexOf("-") > 0) {
        raw = raw.replace(/-/g, "");
      }

      if (dotIndex !== -1 && raw.length - dotIndex - 1 > maxDecimals) {
        raw = raw.substring(0, dotIndex + 1 + maxDecimals);
      }

      if (raw !== "" && raw !== "-" && raw !== "." && raw !== "-.") {
        const num = parseFloat(raw);
        if (!isNaN(num)) {
          if (max !== undefined && num > max) {
            raw = String(max);
          }
          if (min !== undefined && num < min) {
            raw = String(min);
          }
        }
      }

      onChange(raw);

      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        const newFormatted = inputRef.current.value;
        const rawBeforeCursor = stripCommas(oldVal.substring(0, cursorPos));
        let digitCount = 0;
        let newPos = 0;
        for (let i = 0; i < newFormatted.length; i++) {
          if (newFormatted[i] !== ",") {
            digitCount++;
          }
          if (digitCount >= rawBeforeCursor.length) {
            newPos = i + 1;
            break;
          }
        }
        if (digitCount < rawBeforeCursor.length) {
          newPos = newFormatted.length;
        }
        inputRef.current.setSelectionRange(newPos, newPos);
      });
    },
    [onChange, maxDecimals, min, max],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (value !== null && value !== undefined && value !== "") {
      const num = Number(value);
      if (!isNaN(num)) {
        if (num % 1 === 0) {
          onChange(String(num));
        } else {
          const str = String(num);
          const [intP, decP] = str.split(".");
          if (decP && decP.length > maxDecimals) {
            onChange(num.toFixed(maxDecimals).replace(/\.?0+$/, ""));
          } else {
            onChange(str);
          }
        }
      }
    }
  }, [value, onChange, maxDecimals]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
      autoComplete="off"
      {...rest}
    />
  );
}
