import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

const getStatusColor = (status) => {
  if (!status) return "#6b7280";
  const normalized = String(status).toLowerCase().replace(/[\s_]+/g, "");
  switch (normalized) {
    case "readytostart":
      return "#22c55e"; // green
    case "skipped":
      return "#ef4444"; // red
    case "yettostart":
      return "#6b7280"; // gray
    case "inprogress":
      return "#f59e0b"; // amber
    case "completed":
      return "#3b82f6"; // blue
    case "paused":
      return "#f97316"; // orange
    default:
      return "#1565c0";
  }
};

function ProcessCardNode({ data }) {
  const { processName, sequenceNo, processId, onProcessClick, status, mode } = data;

  const isBatch = mode === "batch";
  const statusColor = isBatch ? getStatusColor(status) : null;
  const handleClassName = isBatch
    ? "!opacity-0 !w-0 !h-0 !min-w-0 !min-h-0 !border-0 !pointer-events-none"
    : "!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white";

  const handleClick = (e) => {
    e.stopPropagation();
    if (onProcessClick && processId) {
      onProcessClick(processId);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={isBatch && statusColor ? { borderColor: statusColor } : undefined}
      className={`bg-white border-3 ${isBatch ? "" : "border-[#1565c0] hover:border-[#0f57a6]"
        } rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all cursor-pointer select-none min-w-[200px] text-center group relative`}
    >
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={handleClassName}
      />

      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={handleClassName}
      />

      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={handleClassName}
      />
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className={handleClassName}
      />

      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={handleClassName}
      />
      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        className={handleClassName}
      />

      <div className="flex items-center justify-center gap-2 py-0.5">
        {sequenceNo && (
          <span className="text-[10px] font-bold text-[#1565c0] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 shrink-0">
            #{sequenceNo}
          </span>
        )}
        <span className="text-sm font-bold text-gray-900 group-hover:text-[#1565c0] transition-colors truncate max-w-[170px]">
          {processName}
        </span>
      </div>
    </div>
  );
}

export default memo(ProcessCardNode);

