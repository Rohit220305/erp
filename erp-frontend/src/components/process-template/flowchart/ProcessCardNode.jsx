import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function ProcessCardNode({ data }) {
  const { processName, sequenceNo, processId, onProcessClick } = data;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onProcessClick && processId) {
      onProcessClick(processId);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border-2 border-[#1565c0] hover:border-[#0f57a6] rounded-xl px-5 py-3 shadow-sm hover:shadow-md transition-all cursor-pointer select-none min-w-[200px] text-center group relative"
    >
      {/* Top Handle (Primary Target) */}
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white"
      />

      {/* Bottom Handle (Primary Source) */}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white"
      />

      {/* Left Handles (Source & Target) */}
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className="!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white"
      />
      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        className="!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white"
      />

      {/* Right Handles (Source & Target) */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className="!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white"
      />
      <Handle
        id="target-right"
        type="target"
        position={Position.Right}
        className="!bg-[#1565c0] !w-2.5 !h-2.5 border-2 border-white"
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
