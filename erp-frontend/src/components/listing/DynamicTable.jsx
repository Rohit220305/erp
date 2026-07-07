import { useState, useEffect, useCallback } from "react";
import { useListing } from "@/context/ListingContext";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export default function DynamicTable({
  headers,
  data,
  renderCell,
  maxHeight = "500px",
}) {
  const { sortField, sortOrder, setSort, columnFilters, setColumnFilters } = useListing();

  // Local state for debounced text inputs
  const [localFilters, setLocalFilters] = useState({});

  // Sync localFilters with context on mount/change
  useEffect(() => {
    setLocalFilters(columnFilters || {});
  }, [columnFilters]);

  const handleSortClick = (key, isSortable) => {
    if (isSortable === false) return;
    if (sortField === key) {
      setSort(key, sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSort(key, "ASC");
    }
  };

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Debounce the localFilter changes to update the context (and trigger fetch)
  useEffect(() => {
    const timer = setTimeout(() => {
      
      if (JSON.stringify(localFilters) !== JSON.stringify(columnFilters)) {
        // Strip out empty values
        const cleanedFilters = {};
        Object.entries(localFilters).forEach(([k, v]) => {
          if (v !== "" && v !== undefined && v !== null) {
            cleanedFilters[k] = v;
          }
        });
        setColumnFilters(cleanedFilters);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localFilters, setColumnFilters, columnFilters]);

  const handleSelectChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    
    // For selects, we update context immediately instead of waiting for debounce
    const cleanedFilters = {};
    Object.entries(updated).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) {
        cleanedFilters[k] = v;
      }
    });
    setColumnFilters(cleanedFilters);
  };

  return (
    <div className="overflow-auto max-h-[92%]">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <tr>
            {headers.map((header, index) => {
              const isSortable = header.sortable !== false;
              const isActiveSort = sortField === header.key;
              return (
                <th
                  key={index}
                  className={`px-4 py-4 text-left font-medium text-sm ${isSortable ? 'cursor-pointer select-none hover:bg-gray-50' : ''} ${isActiveSort ? 'text-blue-600 font-semibold' : ''}`}
                  onClick={() => handleSortClick(header.key, header.sortable)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header.label}</span>
                    {isActiveSort && isSortable && (
                      <span className="text-blue-500">
                        {sortOrder === "ASC" ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
          <tr className="bg-gray-50/50">
            {headers.map((header, index) => {
              if (header.searchable === false) {
                return <th key={`filter-${index}`} className="px-4 py-2 border-b border-gray-200"></th>;
              }

              // Determine if we should render a select or text input based on config type
              if (header.type === "select" && header.options) {
                return (
                  <th key={`filter-${index}`} className="px-4 py-2 border-b border-gray-200">
                    <select
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                      value={localFilters[header.key] || ""}
                      onChange={(e) => handleSelectChange(header.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {header.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </th>
                );
              }

              return (
                <th key={`filter-${index}`} className="px-4 py-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder={`Search...`}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                    value={localFilters[header.key] || ""}
                    onChange={(e) => handleFilterChange(header.key, e.target.value)}
                  />
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {(!data || data.length === 0) ? (
            <tr>
              <td colSpan={headers.length} className="p-10 text-center text-gray-400 text-sm">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm">
                    {renderCell ? renderCell(item, header.key) : item[header.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

