"use client";

import { useMemo } from "react";
import { Country } from "country-state-city";

export default function DialCodeSelect({ value, onChange, disabled = false }) {
  const options = useMemo(() => {
    const seen = new Set();
    return Country.getAllCountries()
      .filter((c) => c.phonecode)
      .reduce((acc, c) => {
        const code = `+${c.phonecode}`;
        if (!seen.has(code)) {
          seen.add(code);
          acc.push({
            label: `${c.name} (${code})`,
            value: code,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1565c0]"
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>   
  );
}
