import React from "react";
import CompanyListCard from "./CompanyListCard";
import CompanyGridCard from "./CompanyGridCard";
import CellRenderer from "@/components/core/dynamic-ui/CellRenderer";
import ActionRenderer from "@/components/core/dynamic-ui/ActionRenderer";

export const CompanyTableView = ({ data, config }) => {
  const columns = config?.columns || [];
  const actions = config?.actions || [];
  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">
        No records found.
      </div>
    );
  }

  // Check if we need to render an actions column
  const tableColumns = [...(columns || [])];
  
  return (
    <div className="bg-white rounded-lg overflow-hidden h-full">
      <div className="overflow-auto max-h-[calc(100vh-250px)]">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <tr>
              {tableColumns.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-4 text-left font-medium text-sm"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
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
            ))}
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



