import React, { useState, useEffect } from "react";
import CompanyListCard from "./CompanyListCard";
import CompanyGridCard from "./CompanyGridCard";
import CellRenderer from "@/components/core/dynamic-ui/CellRenderer";
import ActionRenderer from "@/components/core/dynamic-ui/ActionRenderer";
import { useListing } from "@/context/ListingContext";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";

export const CompanyTableView = ({ data, config, loading = false }) => {
  const columns = config?.columns || [];
  const actions = config?.actions || [];
  const { sortField, sortOrder, setSort, columnFilters, setColumnFilters } = useListing();

  // Local state for debounced text inputs
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

  const tableColumns = [...(columns || [])];
  
  return (
    <div className="bg-white rounded-lg overflow-hidden h-full">
      <div className="overflow-auto max-h-[calc(100vh-250px)]">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <tr>
              {tableColumns.map((header, index) => {
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
              {tableColumns.map((header, index) => {
                if (header.searchable === false) {
                  return <th key={`filter-${index}`} className="px-4 py-2 border-b border-gray-200"></th>;
                }
                if (header.options) {
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
          <tbody className={`transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={tableColumns.length} className="p-10 text-center text-gray-400 text-sm">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item.id || rowIndex}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  {tableColumns.map((col, colIndex) => {
                    return (
                      <td key={colIndex} className="px-4 py-3 text-sm">
                        <CellRenderer company={item} column={col} companyConfig={config} />
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const CompanyListView = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        No records found.
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg overflow-hidden h-full">
      <div className="overflow-auto max-h-[calc(100vh-250px)] pb-20">
        <div className="flex flex-col gap-2 p-4">
          {data.map((item) => (
            <CompanyListCard key={item.id} company={item} companyConfig={config} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const CompanyGridView = ({ data, config }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        No records found.
      </div>
    );
  }
  return (
    <div className="rounded-lg overflow-hidden h-full">
      <div className="overflow-auto max-h-[calc(100vh-250px)] pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
          {data.map((item) => (
            <CompanyGridCard key={item.id} company={item} companyConfig={config} />
          ))}
        </div>
      </div>
    </div>
  );
};





