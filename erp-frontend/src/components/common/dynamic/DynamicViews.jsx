"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";
import { FieldFormatter } from "@/dynamicComponents/display/FieldFormatter";
import CellRenderer from "@/components/core/dynamic-ui/CellRenderer";
import { useListing } from "@/context/ListingContext";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import Select from "react-select";
import Loader from "@/components/common/Loader";

const resolvePath = (obj, path) => {
  if (!path || !obj) return null;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const formatValue = (val, colKey) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "object") {
    if (Array.isArray(val)) {
      if (val.length === 0) return "—";
      return val
        .map((item) =>
          typeof item === "object" && item !== null
            ? item.currencyCode || item.code || item.name || JSON.stringify(item)
            : String(item)
        )
        .join(", ");
    }
    return val.currencyCode || val.code || val.name || JSON.stringify(val);
  }
  return String(val);
};

export const DynamicListCard = ({ item, config, setSelectedItemForDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { can } = useAuth();
  
  const listConfig = config.listCard;
  if (!listConfig) return null;

  const viewPermission = config.actions?.viewPermission || config.permissions?.view;
  const hasViewPerm = !viewPermission || can(viewPermission);

  const columns = listConfig.layout?.columns || (1 + (listConfig.columns?.length || 0));
  
  const mainRow = listConfig.mainRow || [
    ...(listConfig.primary ? [{
      type: "identity",
      label: config.moduleName || "Record",
      image: typeof listConfig.primary.image === 'object' ? listConfig.primary.image : { key: listConfig.primary.image },
      primaryValue: typeof listConfig.primary.title === 'object' ? listConfig.primary.title : { key: listConfig.primary.title },
      secondaryValue: typeof listConfig.primary.subtitle === 'object' ? listConfig.primary.subtitle : { key: listConfig.primary.subtitle }
    }] : []),
    ...(listConfig.columns || [])
  ];

  const extendedRows = listConfig.extendedRows || listConfig.expanded || [];

  const renderField = (field, idx) => {
    if (!field || (!field.key && !field.label && field.type !== "identity")) {
      return <div key={idx} className="min-w-0" />;
    }

    if (field.type === "identity") {
      const image = field.image?.key ? resolvePath(item, field.image.key) : null;
      const titleRaw = field.primaryValue?.key ? resolvePath(item, field.primaryValue.key) : "";

      return (
        <div key={`id-${idx}`} className="min-w-0">
          <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
            {field.label || config.moduleName || "Record"}
          </p>
          <div className="flex items-center gap-3">
            {field.image?.key && (
               <SharedImageZoom
                 id={`list-${item.id}`}
                 src={image}
                 alt={titleRaw}
                 placeholderText={<ImageIcon size={18} />}
                 thumbnailClassName="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                 modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
               />
            )}
            <div className="min-w-0">
              {hasViewPerm ? (
                <div className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-semibold text-sm truncate">
                  {field.primaryValue?.key ? (
                    <FieldFormatter field={field.primaryValue} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
                  ) : "—"}
                </div>
              ) : (
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {field.primaryValue?.key ? (
                    <FieldFormatter field={field.primaryValue} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
                  ) : "—"}
                </div>
              )}
              <div className="text-[11px] text-gray-400 mt-0.5 no-underline truncate">
                {field.secondaryValue?.key ? (
                  <FieldFormatter field={field.secondaryValue} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
                ) : "—"}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={`field-${idx}`} className="min-w-0">
        <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
          {field.label}
        </p>
        <div className="text-[13px] text-gray-800 font-medium truncate">
          <FieldFormatter field={field} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
        </div>
      </div>
    );
  };

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-start px-6 py-4">
          <div
            className="grid gap-4 items-start flex-1 min-w-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {mainRow.map((field, idx) => renderField(field, idx))}
          </div>

          {(extendedRows && extendedRows.length > 0) && (
            <div className="w-12 shrink-0 flex justify-end">
              <div
                className="flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown
                  className={`text-[#1565c0] transition-transform duration-400 ${isExpanded ? "rotate-180" : ""}`}
                  size={20}
                />
              </div>
            </div>
          )}
        </div>

        {(extendedRows && extendedRows.length > 0) && (
          <div
            className={`transition-all duration-400 ease-in-out overflow-hidden ${
              isExpanded ? "max-h-[1000px] opacity-100 " : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
              <div
                className="grid gap-4 items-start pr-12"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {extendedRows.map((field, idx) => renderField(field, idx))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const LAYOUT_MAP = {
  horizontal: "grid grid-cols-[120px_1fr] items-center gap-2",
  vertical:   "flex flex-col gap-1",
};

const ALIGN_MAP = {
  left:   "text-left",
  right:  "text-right items-end",
  center: "text-center items-center",
};

const VARIANT_MAP = {
  standard:   "text-sm text-gray-900",
  emphasized: "text-sm font-semibold text-gray-800",
  metric:     "text-base font-bold text-gray-900",
  muted:      "text-xs text-gray-400",
};

const DynamicGridField = ({ field, item, onOpenDrawer }) => {
  const val = resolvePath(item, field.key);
  if (val === null || val === undefined || val === "") return null;

  const layout = field.layout || "horizontal";
  const align = field.align || "left";
  const variant = field.variant || "standard";

  return (
    <div className={`${LAYOUT_MAP[layout]} ${ALIGN_MAP[align]}`}>
      {field.label && (
        <span className="text-xs text-gray-400">{field.label}</span>
      )}
      <span className={`${VARIANT_MAP[variant]} truncate`}>
        <FieldFormatter field={field} rowData={item} onOpenDrawer={onOpenDrawer} />
      </span>
    </div>
  );
};

export const DynamicGridCard = ({ item, config, setSelectedItemForDetails }) => {
  const { can } = useAuth();
  
  const gridConfig = config.gridCard;
  if (!gridConfig) return null;

  const viewPermission = config.actions?.viewPermission || config.permissions?.view;
  const hasViewPerm = !viewPermission || can(viewPermission);

  const headerLeft = gridConfig.header?.left || gridConfig.header; // Fallback for older configs
  const headerRight = gridConfig.header?.right;

  const imageConfig = typeof headerLeft?.image === 'object' ? headerLeft.image : { key: headerLeft?.image };
  const titleConfig = typeof headerLeft?.title === 'object' ? headerLeft.title : { key: headerLeft?.title };
  const subtitleConfig = typeof headerLeft?.subtitle === 'object' ? headerLeft.subtitle : { key: headerLeft?.subtitle };
  const badgeConfig = typeof headerRight?.badge === 'object' ? headerRight.badge : { key: headerRight?.badge, type: 'statusBadge' };

  const image = resolvePath(item, imageConfig.key);
  const titleRaw = resolvePath(item, titleConfig.key);
  const badgeValue = resolvePath(item, badgeConfig.key);

  const hasSubHeader = gridConfig.subHeader?.left?.length > 0 || gridConfig.subHeader?.right?.actions?.length > 0;
  const hasDetails = gridConfig.details?.length > 0;
  const hasMetrics = gridConfig.metrics?.length > 0;
  const hasFooter = !!gridConfig.footer;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col gap-4">
      
      {/* ZONE 1: HEADER */}
      {gridConfig.header && (
        <div className="flex items-start justify-between">
          <div 
            className={`flex items-center gap-3 min-w-0 ${hasViewPerm ? "cursor-pointer" : ""}`}
            onClick={() => hasViewPerm && setSelectedItemForDetails && setSelectedItemForDetails(item)}
          >
            {headerLeft?.image && (
               <div className="relative shrink-0">
                 <SharedImageZoom
                   id={`grid-${item.id}`}
                   src={image}
                   alt={titleRaw}
                   placeholderText={titleRaw?.[0] || "O"}
                   thumbnailClassName="w-14 h-14 rounded-xl object-cover border border-gray-100"
                   modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
                 />
               </div>
            )}
            <div className="min-w-0">
              <div className={`font-medium leading-tight mb-0.5 truncate ${hasViewPerm ? "text-[#1565c0] hover:underline decoration-1 underline-offset-2" : "text-gray-900"}`}>
                {titleConfig.key ? (
                  <FieldFormatter field={titleConfig} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
                ) : "—"}
              </div>
              <div className="text-gray-400 text-sm mt-1 leading-tight truncate">
                {subtitleConfig.key ? (
                  <FieldFormatter field={subtitleConfig} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
                ) : "—"}
              </div>
            </div>
          </div>
          {headerRight?.badge && badgeValue && (
            <div className="shrink-0 ml-3">
              <FieldFormatter field={badgeConfig} rowData={item} onOpenDrawer={setSelectedItemForDetails} />
            </div>
          )}
        </div>
      )}

      {/* ZONE 2: SUB-HEADER */}
      {hasSubHeader && (
        <>
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-4">
              {gridConfig.subHeader.left?.map((field, idx) => (
                <DynamicGridField key={idx} field={field} item={item} onOpenDrawer={setSelectedItemForDetails} />
              ))}
            </div>
            {gridConfig.subHeader.right?.actions?.map((action, idx) => (
              <button key={idx} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ZONE 3: DETAILS */}
      {hasDetails && (
        <>
          <hr className="border-gray-100" />
          <div className="space-y-3">
            {gridConfig.details.map((field, idx) => (
              <DynamicGridField key={idx} field={field} item={item} onOpenDrawer={setSelectedItemForDetails} />
            ))}
          </div>
        </>
      )}

      {/* ZONE 4: METRICS */}
      {hasMetrics && (
        <>
          <hr className="border-gray-100" />
          <div className="flex items-center justify-between gap-4">
            {gridConfig.metrics.map((field, idx) => (
              <DynamicGridField key={idx} field={field} item={item} onOpenDrawer={setSelectedItemForDetails} />
            ))}
          </div>
        </>
      )}

      {/* ZONE 5: FOOTER */}
      {hasFooter && (
        <>
          <hr className="border-gray-100" />
          <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
             {gridConfig.footer.image && (
               <img src={resolvePath(item, gridConfig.footer.image.key) || "/placeholder-avatar.png"} alt="Creator" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
             )}
             <div className="min-w-0 flex-1">
               <div className="text-sm font-medium text-gray-700 truncate">
                 {gridConfig.footer.title?.key ? <FieldFormatter field={gridConfig.footer.title} rowData={item} onOpenDrawer={setSelectedItemForDetails} /> : "—"}
               </div>
               <div className="text-xs text-gray-400 mt-0.5 truncate">
                 {gridConfig.footer.subtitle?.key ? <FieldFormatter field={gridConfig.footer.subtitle} rowData={item} onOpenDrawer={setSelectedItemForDetails} /> : "—"}
               </div>
             </div>
          </div>
        </>
      )}

    </div>
  );
};

export const DynamicListView = ({ data, config, setSelectedItemForDetails, renderCard }) => {
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
        <div className="flex flex-col">
          {data.map((item, idx) =>
            renderCard
              ? <div key={item.id || idx} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {renderCard(item)}
                </div>
              : <div key={item.id || idx} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <DynamicListCard item={item} config={config} setSelectedItemForDetails={setSelectedItemForDetails} />
                </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DynamicGridView = ({ data, config, setSelectedItemForDetails, renderCard }) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
          {data.map((item, idx) =>
            renderCard
              ? <div key={item.id || idx} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${idx * 0.05}s` }}>
                  {renderCard(item)}
                </div>
              : <div key={item.id || idx} className="animate-fade-in-up opacity-0" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <DynamicGridCard item={item} config={config} setSelectedItemForDetails={setSelectedItemForDetails} />
                </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DynamicTableView = ({ data, config, onRowAction, loading = false, setSelectedItemForDetails, renderTableRow }) => {
  const columns = config?.columns || [];
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
    <div className="bg-white rounded-lg overflow-hidden h-full relative">
      {loading && <Loader overlay />}
      <div className="overflow-auto h-[calc(100vh-255px)] pb-14">
        <table className="w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <tr>
              {tableColumns.map((header, index) => {
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
              {tableColumns.map((header, index) => {
                const widthStyle = header.width ? { width: header.width, minWidth: header.width, maxWidth: header.width } : {};
                return (
                  <th key={`filter-${index}`} style={widthStyle} className="p-0 border-b border-gray-200">
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${showColumnSearch ? "grid-rows-[1fr] opacity-100 py-2 px-4" : "grid-rows-[0fr] opacity-0 py-0 px-4"
                        }`}
                    >
                      <div className="overflow-hidden">
                        {header.searchable !== false && (
                          header.options ? (
                            <Select
                              classNamePrefix="react-select"
                              options={[{ label: 'All', value: '' }, ...header.options]}
                              value={
                                localFilters[header.key]
                                  ? {
                                    value: localFilters[header.key],
                                    label: header.options.find((o) => o.value === localFilters[header.key])?.label || localFilters[header.key]
                                  }
                                  : { label: 'All', value: '' }
                              }
                              onChange={(selected) => handleSelectChange(header.key, selected ? selected.value : '')}
                              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                              menuPlacement="bottom"
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({
                                  ...base,
                                  minHeight: '30px',
                                  height: '30px',
                                  borderRadius: '0.25rem',
                                  borderColor: '#d1d5db',
                                  boxShadow: 'none',
                                  fontSize: '0.875rem',
                                  fontWeight: 'normal',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    borderColor: '#3b82f6'
                                  }
                                }),
                                valueContainer: (base) => ({ ...base, padding: '0 8px', height: '30px', display: 'flex', justifyContent: 'flex-start' }),
                                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                                indicatorSeparator: (base) => ({ ...base, display: 'none' }),
                                dropdownIndicator: (base) => ({ ...base, padding: '2px 8px' }),
                                option: (base) => ({ ...base, fontSize: '0.875rem', textAlign: 'left', cursor: 'pointer' }),
                                singleValue: (base) => ({ ...base, fontSize: '0.875rem', textAlign: 'left' })
                              }}
                            />
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
          <tbody className={`transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan={tableColumns.length} className="p-10 text-center text-gray-400 text-sm">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((record, rowIndex) =>
                renderTableRow ? (
                  <React.Fragment key={record.id || rowIndex}>
                    {renderTableRow(record, onRowAction, setSelectedItemForDetails)}
                  </React.Fragment>
                ) : (
                  <tr
                    key={record.id || rowIndex}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    {tableColumns.map((col, colIndex) => {
                      return (
                        <td key={colIndex} className="px-4 py-3 text-sm">
                          <CellRenderer
                            item={record}
                            column={col}
                            config={config}
                            onRowAction={onRowAction}
                            setSelectedItemForDetails={setSelectedItemForDetails}
                          />
                        </td>
                      );
                    })}
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
