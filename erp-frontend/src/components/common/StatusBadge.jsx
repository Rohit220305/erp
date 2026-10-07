import React from 'react';
import { getStatusDisplay } from '@/utils/status-formatter';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, module = null, className = '', variant = 'badge' }) {
  if (!status) return <span className="text-gray-400 font-semibold">—</span>;

  const display = getStatusDisplay(status, module);
  
  if (variant === 'text') {
    return (
      <span className={cn("font-semibold", display.color, className)}>
        {display.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs",
        display.bg,
        display.color,
        className
      )}
    >
      {display.label}
    </span>
  );
}

