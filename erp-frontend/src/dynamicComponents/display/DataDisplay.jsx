import React from 'react';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import SharedImageZoom from '@/components/common/SharedImageZoom';
import { cn } from '@/lib/utils';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const formatCurrency = (value, currency = 'INR') => {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(value);
};

import { getStatusDisplay } from '@/utils/status-formatter';

export const StatusBadge = ({ status, module = null, size = 'md', className = '', variant = 'badge' }) => {
  if (!status) return <span className="text-gray-400 font-semibold">—</span>;

  const display = getStatusDisplay(status, module);

  if (variant === 'text') {
    return (
      <span className={cn("font-semibold", display.color, className)}>
        {display.label}
      </span>
    );
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        sizeClass,
        display.bg,
        display.color,
        className
      )}
    >
      {display.label}
    </span>
  );
};

export const AvatarInitials = ({ name, size = 'md', bgColor = 'bg-[#1565c0]', className = '' }) => {
  if (!name) return null;
  const initials = name.substring(0, 1).toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-medium ${bgColor} ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  );
};

export const AvatarImage = ({ src, alt, size = 'md', className = '', id }) => {
  if (!src) return <AvatarInitials name={alt || 'NA'} size={size} className={className} />;

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const imageId = id || (typeof src === 'string' ? src.substring(src.lastIndexOf('/') + 1).replace(/[^a-zA-Z0-9]/g, '') : Math.random().toString(36).substr(2, 9));

  return (
    <SharedImageZoom
      id={imageId}
      src={src}
      alt={alt || 'Avatar'}
      thumbnailClassName={`rounded-full ${sizeClasses[size]} ${className}`}
      objectFit="cover"
    />
  );
};

export const CodeChip = ({ text, className = '' }) => {
  if (!text) return null;
  return (
    <span
      className={`inline-block bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-xs text-gray-700 ${className}`}
    >
      {text}
    </span>
  );
};

export const DateDisplay = ({ date, className = '' }) => {
  return <span className={`text-sm text-gray-900 ${className}`}>{formatDate(date)}</span>;
};

export const CurrencyDisplay = ({ value, currency, className = '' }) => {
  return <span className={`text-sm text-gray-900 ${className}`}>{formatCurrency(value, currency)}</span>;
};

export const DataLabel = ({ label, value, displayType = 'text', href, className = '' }) => {
  const renderValue = () => {

    if (value === null || value === undefined || value === '') {
      return <span className="text-sm text-gray-400">—</span>;
    }

    switch (displayType) {
      case 'statusBadge':
        return <StatusBadge status={value} />;
      case 'link':
        return (
          <Link href={href || '#'} className="text-sm font-medium text-[#1565c0] hover:underline">
            {value}
          </Link>
        );
      case 'date':
        return <DateDisplay date={value} />;
      case 'currency':
        return <CurrencyDisplay value={value} />;
      case 'code':
        return <CodeChip text={value} />;
      case 'text':
      default:
        return <span className="text-sm font-medium text-gray-900">{value}</span>;
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <div>{renderValue()}</div>
    </div>
  );
};

export const EmptyState = ({
  title = 'No Data Found',
  message = 'There is currently no data available to display.',
  icon: Icon = SearchX,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 border border-gray-200 border-dashed rounded-lg ${className}`}
    >
      <div className="bg-white p-3 rounded-full shadow-sm border border-gray-100 mb-3">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm">{message}</p>
    </div>
  );
};
