import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function FinishNode({ data }) {
  return (
    <div className="w-16 h-16 rounded-full bg-[#1e293b] text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-slate-900 select-none">
      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!bg-slate-900 !w-3 !h-3"
      />
      {data?.label || "Finish!"}
    </div>
  );
}

export default memo(FinishNode);
