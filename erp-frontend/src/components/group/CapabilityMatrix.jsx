"use client";

import { useMemo } from "react";

export default function CapabilityMatrix({ capabilities, selectedCodes, onChange }) {
  const groupedCapabilities = useMemo(() => {
    const groups = {};
    capabilities.forEach((cap) => {
      const mod = cap.moduleName;
      if (!groups[mod]) {
        groups[mod] = {
          moduleName: mod,
          VIEW: null,
          ADD: null,
          EDIT: null,
          DELETE: null,
          custom: [],
        };
      }
      if (["VIEW", "ADD", "EDIT", "DELETE"].includes(cap.actionName)) {
        groups[mod][cap.actionName] = cap;
      } else {
        groups[mod].custom.push(cap);
      }
    });
    return Object.values(groups).sort((a, b) => a.moduleName.localeCompare(b.moduleName));
  }, [capabilities]);

  const handleCheckboxChange = (code, checked) => {
    if (checked) {
      onChange([...selectedCodes, code]);
    } else {
      onChange(selectedCodes.filter((c) => c !== code));
    }
  };

  const isChecked = (code) => {
    return selectedCodes.includes(code);
  };

  const renderCheckbox = (cap) => {
    if (!cap) {
      return <span className="text-gray-300">—</span>;
    }
    return (
      <label className="inline-flex items-center justify-center cursor-pointer p-2 rounded hover:bg-gray-50 transition">
        <input
          type="checkbox"
          checked={isChecked(cap.capabilityCode)}
          onChange={(e) => handleCheckboxChange(cap.capabilityCode, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#1565c0] focus:ring-[#1565c0]/20 transition cursor-pointer"
        />
      </label>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Capability Matrix</h3>
          <p className="text-xs text-gray-500 mt-0.5">Assign module-level permissions for this role</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(capabilities.map((c) => c.capabilityCode))}
            className="text-xs text-[#1565c0] hover:underline font-medium cursor-pointer"
          >
            Select All
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-500 hover:underline font-medium cursor-pointer"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Module / Feature</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-28">View</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-28">Create</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-28">Edit</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-28">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {groupedCapabilities.map((group) => (
              <tr key={group.moduleName} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-700">{group.moduleName}</span>
                </td>
                <td className="px-6 py-4 text-center">{renderCheckbox(group.VIEW)}</td>
                <td className="px-6 py-4 text-center">{renderCheckbox(group.ADD)}</td>
                <td className="px-6 py-4 text-center">{renderCheckbox(group.EDIT)}</td>
                <td className="px-6 py-4 text-center">{renderCheckbox(group.DELETE)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
