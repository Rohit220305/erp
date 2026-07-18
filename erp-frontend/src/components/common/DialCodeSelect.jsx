"use client";

import { Country } from "country-state-city";

const DIAL_CODE_OPTIONS = (() => {
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
})();

export default function DialCodeSelect({ value, onChange, disabled = false }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className="w-24 px-2 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#1565c0]"
    >
      <option value=""></option>
      {DIAL_CODE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
