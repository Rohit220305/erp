import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function StartNode({ data }) {
  return (
    <div className="w-16 h-16 rounded-full bg-[#16a34a] text-white font-bold flex items-center justify-center text-sm shadow-md border-2 border-green-700 select-none">
      {data?.label || "Start"}
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className="!bg-green-700 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(StartNode);
