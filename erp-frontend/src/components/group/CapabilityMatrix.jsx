"use client";

const ACTION_COLUMNS = [
  { key: "LIST",   label: "List" },
  { key: "VIEW",   label: "View" },
  { key: "CREATE", label: "Create" },
  { key: "UPDATE", label: "Update" },
  { key: "DELETE", label: "Delete" },
  // { key: "EXPORT", label: "Export" },
  // { key: "PRINT",  label: "Print" },
];

export default function CapabilityMatrix({ capabilities = [], selectedCodes = [], onChange }) {
  const groups = {};
  (capabilities || []).forEach((cap) => {
    const mod = cap.moduleName;
    if (!groups[mod]) {
      groups[mod] = {
        moduleName: mod,
        LIST: null,
        VIEW: null,
        CREATE: null,
        UPDATE: null,
        DELETE: null,
        EXPORT: null,
        PRINT: null,
        custom: [],
      };
    }
    let actionKey = cap.actionName?.toUpperCase() || "";
    if (!ACTION_COLUMNS.some((c) => c.key === actionKey)) {
      if (actionKey.includes("LIST")) actionKey = "LIST";
      else if (actionKey.includes("VIEW")) actionKey = "VIEW";
      else if (actionKey.includes("CREATE")) actionKey = "CREATE";
      else if (actionKey.includes("UPDATE")) actionKey = "UPDATE";
      else if (actionKey.includes("DELETE")) actionKey = "DELETE";
      else if (actionKey.includes("EXPORT")) actionKey = "EXPORT";
      else if (actionKey.includes("PRINT")) actionKey = "PRINT";
      else {
        const codeUpper = cap.capabilityCode?.toUpperCase() || "";
        const matchedCol = ACTION_COLUMNS.find((col) => codeUpper.endsWith(`_${col.key}`));
        if (matchedCol) actionKey = matchedCol.key;
      }
    }

    if (ACTION_COLUMNS.some((c) => c.key === actionKey)) {
      groups[mod][actionKey] = cap;
    } else {
      groups[mod].custom.push(cap);
    }
  });
  const groupedCapabilities = Object.values(groups).sort((a, b) =>
    a.moduleName.localeCompare(b.moduleName)
  );

  const handleCheckboxChange = (code, checked) => {
    if (checked) {
      onChange([...selectedCodes, code]);
    } else {
      onChange(selectedCodes.filter((c) => c !== code));
    }
  };

  const isChecked = (code) => selectedCodes.includes(code);

  const renderCheckbox = (cap, label) => {
    if (!cap) {
      return (
        <label className="inline-flex items-center gap-1.5 p-2 rounded">
          <input
            type="checkbox"
            checked={false}
            readOnly
            className="w-4 h-4 rounded border-gray-300"
          />
          {label && <span className="text-xs text-gray-600">{label}</span>}
        </label>
      );
    }
    return (
      <label className="inline-flex items-center gap-1.5 cursor-pointer p-2 rounded hover:bg-gray-50 transition">
        <input
          type="checkbox"
          checked={isChecked(cap.capabilityCode)}
          onChange={(e) => handleCheckboxChange(cap.capabilityCode, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#1565c0] focus:ring-[#1565c0]/20 transition cursor-pointer"
        />
        {label && <span className="text-xs text-gray-600">{label}</span>}
      </label>
    );
  };

  const capsInColumn = (actionKey) =>
    capabilities.filter((c) => c.actionName?.toUpperCase() === actionKey);

  const isColumnAllChecked = (actionKey) => {
    const caps = capsInColumn(actionKey);
    return caps.length > 0 && caps.every((c) => selectedCodes.includes(c.capabilityCode));
  };

  const toggleColumn = (actionKey, checked) => {
    const codes = capsInColumn(actionKey).map((c) => c.capabilityCode);
    if (checked) {
      onChange([...new Set([...selectedCodes, ...codes])]);
    } else {
      onChange(selectedCodes.filter((c) => !codes.includes(c)));
    }
  };

  const capsInRow = (group) =>
    ACTION_COLUMNS.map((col) => group[col.key]).filter(Boolean);

  const isRowAllChecked = (group) => {
    const caps = capsInRow(group);
    return caps.length > 0 && caps.every((c) => selectedCodes.includes(c.capabilityCode));
  };

  const toggleRow = (group, checked) => {
    const codes = capsInRow(group).map((c) => c.capabilityCode);
    if (checked) {
      onChange([...new Set([...selectedCodes, ...codes])]);
    } else {
      onChange(selectedCodes.filter((c) => !codes.includes(c)));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Capability Matrix</h3>
          <p className="text-xs text-gray-500 mt-0.5">Assign module-level permissions for this role</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-gray-100 bg-gray-50/30">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Select Modules
              </th>

              {ACTION_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="checkbox"
                      checked={isColumnAllChecked(col.key)}
                      onChange={(e) => toggleColumn(col.key, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1565c0] focus:ring-[#1565c0]/20 cursor-pointer accent-[#1565c0]"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {groupedCapabilities.map((group) => (
              <tr key={group.moduleName} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isRowAllChecked(group)}
                      onChange={(e) => toggleRow(group, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1565c0] focus:ring-[#1565c0]/20 cursor-pointer accent-[#1565c0]"
                    />
                    <span className="text-sm font-medium text-gray-700">{group.moduleName}</span>
                  </div>
                </td>

                {ACTION_COLUMNS.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-center">
                    {renderCheckbox(group[col.key], col.label)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
