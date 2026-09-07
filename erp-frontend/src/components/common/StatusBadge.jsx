import React from 'react';
import { getStatusDisplay } from '@/utils/status-formatter';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return <span className="text-gray-400 font-semibold">—</span>;

  const display = getStatusDisplay(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${display.bg} ${display.color} ${className}`}
    >
      {display.dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${display.dot}`} />
      )}
      {display.label}
    </span>
  );
}
