"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  reconnectEdge,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildFlowchartGraph } from "@/utils/flowchart-layout";
import StartNode from "./StartNode";
import FinishNode from "./FinishNode";
import ProcessCardNode from "./ProcessCardNode";
import { Lock, Unlock, RotateCcw } from "lucide-react";

const nodeTypes = {
  startNode: StartNode,
  finishNode: FinishNode,
  processCardNode: ProcessCardNode,
};

export default function ProcessFlowchartContainer({ processes = [], onOpenProcessDrawer }) {
  const { can } = useAuth();
  const canUpdate = can(
    CAPABILITIES.PROCESS_TEMPLATE?.UPDATE || "PROCESS_TEMPLATE_UPDATE"
  );

  const [isEditMode, setIsEditMode] = useState(false);

  const initialGraph = useMemo(() => {
    return buildFlowchartGraph(processes);
  }, [processes]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Inject onProcessClick into node data
  const enrichNodes = useCallback(
    (rawNodes) => {
      return rawNodes.map((node) => {
        if (node.type === "processCardNode") {
          return {
            ...node,
            data: {
              ...node.data,
              onProcessClick: onOpenProcessDrawer,
            },
          };
        }
        return node;
      });
    },
    [onOpenProcessDrawer]
  );

  useEffect(() => {
    setNodes(enrichNodes(initialGraph.nodes));
    setEdges(initialGraph.edges);
  }, [initialGraph, enrichNodes, setNodes, setEdges]);

  const handleResetLayout = () => {
    const resetGraph = buildFlowchartGraph(processes);
    setNodes(enrichNodes(resetGraph.nodes));
    setEdges(resetGraph.edges);
  };

  const handleNodeClick = (_, node) => {
    if (!isEditMode && node.type === "processCardNode" && node.data?.processId && onOpenProcessDrawer) {
      onOpenProcessDrawer(node.data.processId);
    }
  };

  const onReconnect = useCallback(
    (oldEdge, newConnection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep", style: { stroke: "#64748b", strokeWidth: 2 } }, eds));
    },
    [setEdges]
  );

  if (!processes || processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <p className="text-sm font-medium">No process steps defined for this template.</p>
        <p className="text-xs text-gray-400 mt-1">Flowchart cannot be rendered.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[620px] bg-slate-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-200 shadow-md">
        {canUpdate && (
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              isEditMode
                ? "bg-amber-500 text-white shadow-sm hover:bg-amber-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isEditMode ? (
              <>
                <Unlock size={14} />
                <span>Lock Flowchart</span>
              </>
            ) : (
              <>
                <Lock size={14} />
              <span>Edit Layout </span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleResetLayout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          title="Reset layout to automatic auto-aligned positions"
        >
          <RotateCcw size={14} />
          <span>Reset Layout</span>
        </button>
      </div>

      {/* Main React Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onReconnect={isEditMode ? onReconnect : undefined}
        onConnect={isEditMode ? onConnect : undefined}
        nodesDraggable={isEditMode}
        nodesConnectable={isEditMode}
        edgesReconnectable={isEditMode}
        elementsSelectable={isEditMode}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.8}
      >
        <Background variant="dots" gap={18} size={1.5} color="#94a3b8" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
