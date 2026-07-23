"use client";

import React, { useState } from "react";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SharedImageZoom from "@/components/common/SharedImageZoom";

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

  const image = resolvePath(item, listConfig.primary?.image);
  const title = resolvePath(item, listConfig.primary?.title);
  const subtitle = resolvePath(item, listConfig.primary?.subtitle);

  const viewPermission = config.actions?.viewPermission || config.permissions?.view;
  const hasViewPerm = !viewPermission || can(viewPermission);

  const totalCols = 1 + (listConfig.columns?.length || 0);

  return (
    <div className="mx-2 my-2">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-400 shadow-sm hover:shadow-md">
        <div className="flex items-center px-6 py-4">
          <div
            className="grid gap-4 items-center flex-1 min-w-0"
            style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
          >
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                {config.moduleName || "Record"}
              </p>
              <div className="flex items-center gap-3">
                {listConfig.primary?.image && (
                   <SharedImageZoom
                     id={`list-${item.id}`}
                     src={image}
                     alt={title}
                     placeholderText={<ImageIcon size={18} />}
                     thumbnailClassName="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                     modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
                   />
                )}
                <div className="min-w-0">
                  {hasViewPerm ? (
                    <span
                      onClick={() => setSelectedItemForDetails && setSelectedItemForDetails(item)}
                      className="block w-fit text-[#1565c0] hover:underline cursor-pointer font-semibold text-sm truncate"
                    >
                      {title || "—"}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {title || "—"}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-0.5 no-underline truncate">
                    {subtitle || "—"}
                  </p>
                </div>
              </div>
            </div>

            {(listConfig.columns || []).map((col, idx) => (
              <div key={idx} className="min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                  {col.label}
                </p>
                <div className="text-[13px] text-gray-800 font-medium truncate">
                  {formatValue(item[col.key], col.key)}
                </div>
              </div>
            ))}
          </div>

          {(listConfig.expanded && listConfig.expanded.length > 0) && (
            <div
              className="flex-shrink-0 ml-4 flex items-center justify-center cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown
                className={`text-[#1565c0] transition-transform duration-400 ${isExpanded ? "rotate-180" : ""}`}
                size={20}
              />
            </div>
          )}
        </div>

        {(listConfig.expanded && listConfig.expanded.length > 0) && (
          <div
            className={`transition-all duration-400 ease-in-out overflow-hidden ${
              isExpanded ? "max-h-[500px] opacity-100 " : "max-h-0 opacity-0"
            }`}
          >
            <div className="px-6 py-5 bg-gray-50/50 border-t border-gray-100">
              <div
                className="grid gap-4 items-start pr-[52px]"
                style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
              >
                {listConfig.expanded.map((col, idx) => {
                  if (!col.key && !col.label) {
                    return <div key={idx} className="min-w-0" />;
                  }
                  return (
                    <div key={idx} className="min-w-0">
                      <p className="text-[11px] text-gray-400 mb-1.5 tracking-wider font-medium">
                        {col.label}
                      </p>
                      <p className="text-[13px] text-gray-800 font-medium truncate">
                        {formatValue(item[col.key], col.key)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const DynamicGridCard = ({ item, config, setSelectedItemForDetails }) => {
  const { can } = useAuth();
  
  const gridConfig = config.gridCard;
  if (!gridConfig) return null;

  const viewPermission = config.actions?.viewPermission || config.permissions?.view;
  const hasViewPerm = !viewPermission || can(viewPermission);

  const image = resolvePath(item, gridConfig.header?.image);
  const title = resolvePath(item, gridConfig.header?.title);
  const subtitle = resolvePath(item, gridConfig.header?.subtitle);
  const badgeValue = resolvePath(item, gridConfig.header?.badge);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div 
          className={`flex items-center gap-3 ${hasViewPerm ? "cursor-pointer" : ""}`}
          onClick={() => hasViewPerm && setSelectedItemForDetails && setSelectedItemForDetails(item)}
        >
          {gridConfig.header?.image && (
             <div className="relative shrink-0">
               <SharedImageZoom
                 id={`grid-${item.id}`}
                 src={image}
                 alt={title}
                 placeholderText={title?.[0] || "O"}
                 thumbnailClassName="w-14 h-14 rounded-xl object-cover border border-gray-100"
                 modalImageClassName="w-64 h-64 rounded-xl shadow-2xl"
               />
               {badgeValue && (
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${badgeValue === "Active" ? "bg-green-500" : "bg-red-500"}`}></div>
               )}
             </div>
          )}
          <div>
            <p className={`font-medium leading-tight mb-0.5 ${hasViewPerm ? "text-[#1565c0] hover:underline decoration-1 underline-offset-2" : "text-gray-900"}`}>
              {title || "—"}
            </p>
            <p className="text-gray-400 text-sm mt-2 leading-tight">
              {subtitle || "—"}
            </p>
          </div>
        </div>
      </div>

      <hr className="border-gray-100 my-4" />

      <div className="space-y-3 text-sm">
        {(gridConfig.details || []).map((detail, idx) => {
          const val = resolvePath(item, detail.key);
          if (!val) return null;
          
          return (
            <div key={idx} className="grid grid-cols-[110px_1fr] items-center gap-2">
              <span className="text-gray-400">{detail.label}</span>
              <span className="text-gray-900 truncate">
                {formatValue(val, detail.key)}
              </span>
            </div>
          );
        })}
        {gridConfig.footer?.date && resolvePath(item, gridConfig.footer.date) && (
          <div className="grid grid-cols-[110px_1fr] items-center gap-2">
            <span className="text-gray-400">Created</span>
            <span className="text-gray-900 truncate">{resolvePath(item, gridConfig.footer.date)}</span>
          </div>
        )}
      </div>
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
              ? <React.Fragment key={item.id || idx}>{renderCard(item)}</React.Fragment>
              : <DynamicListCard key={item.id || idx} item={item} config={config} setSelectedItemForDetails={setSelectedItemForDetails} />
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
              ? <React.Fragment key={item.id || idx}>{renderCard(item)}</React.Fragment>
              : <DynamicGridCard key={item.id || idx} item={item} config={config} setSelectedItemForDetails={setSelectedItemForDetails} />
          )}
        </div>
      </div>
    </div>
  );
};
