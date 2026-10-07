"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { 
  DataLabel, 
  AvatarImage, 
  DateDisplay, 
  StatusBadge 
} from '../display/DataDisplay';
import { ActionDropdown, IconButton } from '../buttons/Buttons';

export const DetailCard = ({ title, columns = 2, children, className = '' }) => {
  const gridClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-4 mb-4">
          {title}
        </h3>
      )}
      <div className={`grid gap-x-12 gap-y-6 ${gridClass}`}>
        {children}
      </div>
    </div>
  );
};

export const UserInfoCard = ({ action, user, date, className = '' }) => {
  if (!user) return null;

  return (
    <div className={`bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-4 ${className}`}>
      <AvatarImage src={user.photoUrl} name={user.name} size="md" />
      <div>
        <p className="text-xs text-gray-500 font-medium mb-0.5">{action}</p>
        <p className="text-sm font-semibold text-[#1565c0]">
          {user.name}
        </p>
        {date && (
          <p className="text-xs text-gray-400 mt-0.5">
            <DateDisplay date={date} format="datetime" />
          </p>
        )}
      </div>
    </div>
  );
};

export const GridCard = ({ 
  image, 
  title, 
  subtitle, 
  status, 
  fields = [], 
  footerDate,
  actions = [],
  onClick,
  className = '' 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        {}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {image && (
              <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border border-gray-100 shrink-0" />
            )}
            <div className="truncate">
              <h4 className="font-semibold text-gray-900 truncate" title={title}>{title}</h4>
              {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5" title={subtitle}>{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {status && <StatusBadge status={status} size="sm" />}
            {actions.length > 0 && (
              <div onClick={e => e.stopPropagation()}>
                <ActionDropdown actions={actions} />
              </div>
            )}
          </div>
        </div>

        {}
        {fields.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-50">
            {fields.map((field, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-500 shrink-0">{field.label}</span>
                <span className="font-medium text-gray-900 truncate text-right">
                  {field.displayType === 'date' ? <DateDisplay date={field.value} /> : field.value || '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {}
      {footerDate && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
          <span>Last updated</span>
          <DateDisplay date={footerDate} format="datetime" />
        </div>
      )}
    </div>
  );
};

export const ListCard = ({
  image,
  title,
  subtitle,
  status,
  primaryFields = [],
  expandedFields = [],
  actions = [],
  onClick,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const hasExpandedFields = expandedFields.length > 0;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all ${className}`}>
      {}
      <div 
        className={`p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${onClick || hasExpandedFields ? 'cursor-pointer' : ''}`}
        onClick={(e) => {
          if (onClick) onClick(e);
          else if (hasExpandedFields) setExpanded(!expanded);
        }}
      >
        {}
        <div className="flex items-center gap-3 w-1/3 min-w-[250px]">
          {image && (
            <img src={image} alt={title} className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0" />
          )}
          <div className="truncate">
            <h4 className="font-semibold text-gray-900 text-sm truncate">{title}</h4>
            {subtitle && <p className="text-xs text-gray-500 truncate mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {}
        <div className="flex-1 flex items-center justify-between px-4 gap-4 hidden md:flex">
          {primaryFields.map((field, idx) => (
            <div key={idx} className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{field.label}</p>
              <p className="text-sm text-gray-800 font-medium truncate">
                {field.displayType === 'date' ? <DateDisplay date={field.value} /> : field.value || '-'}
              </p>
            </div>
          ))}
        </div>

        {}
        <div className="flex items-center gap-3 shrink-0">
          {status && <StatusBadge status={status} size="sm" />}
          
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {hasExpandedFields && (
              <IconButton 
                icon={expanded ? ChevronUp : ChevronDown} 
                onClick={() => setExpanded(!expanded)} 
                title={expanded ? "Collapse" : "Expand"}
              />
            )}
            {actions.length > 0 && <ActionDropdown actions={actions} />}
          </div>
        </div>
      </div>

      {}
      {expanded && hasExpandedFields && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {expandedFields.map((field, idx) => (
            <DataLabel 
              key={idx}
              label={field.label}
              value={field.value}
              displayType={field.displayType}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, className = '' }) => {
  const getTrendConfig = () => {
    if (trend === 'up') return { color: 'text-green-600', icon: TrendingUp, bg: 'bg-green-50' };
    if (trend === 'down') return { color: 'text-red-600', icon: TrendingDown, bg: 'bg-red-50' };
    return { color: 'text-gray-500', icon: Minus, bg: 'bg-gray-100' };
  };

  const trendConfig = getTrendConfig();
  const TrendIcon = trendConfig.icon;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {Icon && (
          <div className="p-2 bg-blue-50 text-[#1565c0] rounded-lg">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${trendConfig.bg} ${trendConfig.color}`}>
            <TrendIcon size={12} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};
