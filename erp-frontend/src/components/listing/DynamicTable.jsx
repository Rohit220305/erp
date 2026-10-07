import { useState, useEffect, } from "react";
import { useListing } from "@/context/ListingContext";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export default function DynamicTable({
  headers,
  data,
  renderCell,
  maxHeight = "500px",
}) {
  const { sortField, sortOrder, setSort, columnFilters, setColumnFilters, showColumnSearch } = useListing();

  const [localFilters, setLocalFilters] = useState({});

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

  useEffect(() => {
    const timer = setTimeout(() => {

      if (JSON.stringify(localFilters) !== JSON.stringify(columnFilters)) {
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
      <table className="w-full table-fixed">
        <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <tr>
            {headers.map((header, index) => {
              const isSortable = header.sortable !== false;
              const isActiveSort = sortField === header.key;
              const widthStyle = header.width ? { width: header.width, minWidth: header.width, maxWidth: header.width } : {};
              return (
                <th
                  key={index}
                  style={widthStyle}
                  className={`px-4 py-4 text-left font-medium text-sm transition-all duration-300 ${isSortable ? 'cursor-pointer select-none hover:bg-gray-50' : ''} ${isActiveSort ? 'text-blue-600 font-semibold' : ''}`}
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
              const widthStyle = header.width ? { width: header.width, minWidth: header.width, maxWidth: header.width } : {};
              return (
                <th key={`filter-${index}`} style={widthStyle} className="p-0 border-b border-gray-200">
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${showColumnSearch ? "grid-rows-[1fr] opacity-100 py-2 px-4" : "grid-rows-[0fr] opacity-0 py-0 px-4"
                      }`}
                  >
                    <div className="overflow-hidden">
                      {header.searchable !== false && (
                        header.type === "select" && header.options ? (
                          <select
                            className="w-full px-2 py-1 text-sm border cursor-pointer border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                            value={localFilters[header.key] || ""}
                            onChange={(e) => handleSelectChange(header.key, e.target.value)}
                          >
                            <option value="" className="cursor-pointer">All</option>
                            {header.options.map((opt) => (
                              <option className="cursor-pointer" key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={`Search...`}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                            value={localFilters[header.key] || ""}
                            onChange={(e) => handleFilterChange(header.key, e.target.value)}
                          />
                        )
                      )}
                    </div>
                  </div>
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

