"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { toast } from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";
import { CAPABILITIES } from "@/config/capabilities.config";
import { buildFlowchartGraph } from "@/utils/flowchart-layout";
import { validateConnection } from "@/utils/sequence-validator";
import StartNode from "./StartNode";
import FinishNode from "./FinishNode";
import ProcessCardNode from "./ProcessCardNode";
import { Lock, Unlock, RotateCcw, Save, Loader2 } from "lucide-react";

const nodeTypes = {
  startNode: StartNode,
  finishNode: FinishNode,
  processCardNode: ProcessCardNode,
};

export default function ProcessFlowchartContainer({
  processes = [],
  onOpenProcessDrawer,
  onProcessesChange,
  onSaveFlowchart,
  isSaving = false,
}) {
  const { can } = useAuth();
  const canUpdate = can(
    CAPABILITIES.PROCESS_TEMPLATE?.UPDATE || "PROCESS_TEMPLATE_UPDATE"
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const reconnectingEdgeRef = useRef(null);

  const initialGraph = useMemo(() => {
    return buildFlowchartGraph(processes);
  }, [processes]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  const extractUpdatedProcesses = useCallback(
    (currentNodes, currentEdges) => {
      const nodePosMap = new Map();
      currentNodes.forEach((n) => {
        if (n.type === "processCardNode") {
          nodePosMap.set(String(n.id), {
            x: Math.round(n.position.x),
            y: Math.round(n.position.y),
          });
        }
      });

      const depMap = new Map();
      const handleMap = new Map();

      currentEdges.forEach((edge) => {
        if (edge.source !== "start" && edge.target !== "finish") {
          const targetId = Number(edge.target);
          const sourceId = Number(edge.source);

          if (!depMap.has(targetId)) depMap.set(targetId, []);
          depMap.get(targetId).push(sourceId);

          if (!handleMap.has(targetId)) handleMap.set(targetId, {});
          handleMap.get(targetId)[String(sourceId)] = {
            sourceHandle: edge.sourceHandle || "bottom",
            targetHandle: edge.targetHandle || "top",
          };
        }
      });

      return processes.map((p) => {
        const pId = Number(p.processId);
        return {
          ...p,
          dependencies: depMap.get(pId) || [],
          nodePosition: nodePosMap.get(String(pId)) || p.nodePosition || null,
          handleConfig: handleMap.get(pId) || p.handleConfig || null,
        };
      });
    },
    [processes]
  );

  const handleResetLayout = () => {
    const cleanProcesses = processes.map((p) => ({
      ...p,
      nodePosition: null,
      handleConfig: null,
    }));
    const resetGraph = buildFlowchartGraph(cleanProcesses);
    setNodes(enrichNodes(resetGraph.nodes));
    setEdges(resetGraph.edges);

    if (onProcessesChange) {
      setTimeout(() => {
        onProcessesChange(cleanProcesses);
      }, 0);
    }
  };

  const handleNodeClick = (_, node) => {
    if (!isEditMode && node.type === "processCardNode" && node.data?.processId && onOpenProcessDrawer) {
      onOpenProcessDrawer(node.data.processId);
    }
  };

  const edgeReconnectSuccessful = useRef(true);

  const onReconnectStart = useCallback((_, edge) => {
    edgeReconnectSuccessful.current = false;
    reconnectingEdgeRef.current = edge;
  }, []);

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current && reconnectingEdgeRef.current) {
     
      const originalEdge = reconnectingEdgeRef.current;
      let restoredEdges = [];
      setEdges((eds) => {
        const exists = eds.some((e) => e.id === originalEdge.id);
        restoredEdges = exists ? eds : [...eds, originalEdge];
        return restoredEdges;
      });
      if (onProcessesChange) {
        setTimeout(() => {
          onProcessesChange(extractUpdatedProcesses(nodes, restoredEdges));
        }, 0);
      }
    }
    reconnectingEdgeRef.current = null;
    edgeReconnectSuccessful.current = true;
  }, [setEdges, onProcessesChange, extractUpdatedProcesses, nodes]);

  const isValidConnectionHandler = useCallback(
    (connection) => {
      const activeEdgeId = reconnectingEdgeRef.current?.id || null;
      const result = validateConnection(connection, nodes, edges, activeEdgeId);
      if (!result.isValid) {
        toast.error(result.reason, { id: "flowchart-val-err" });
        return false;
      }
      return true;
    },
    [nodes, edges]
  );

  const onReconnect = useCallback(
    (oldEdge, newConnection) => {
      if (!isValidConnectionHandler(newConnection)) return;
      edgeReconnectSuccessful.current = true;
      reconnectingEdgeRef.current = null;
      let updatedEdges = [];
      setEdges((els) => {
        updatedEdges = reconnectEdge(oldEdge, newConnection, els);
        return updatedEdges;
      });
      if (onProcessesChange) {
        setTimeout(() => {
          onProcessesChange(extractUpdatedProcesses(nodes, updatedEdges));
        }, 0);
      }
    },
    [isValidConnectionHandler, setEdges, onProcessesChange, extractUpdatedProcesses, nodes]
  );

  const onConnect = useCallback(
    (connection) => {
      if (!isValidConnectionHandler(connection)) return;
      let updatedEdges = [];
      setEdges((eds) => {
        updatedEdges = addEdge(
          { ...connection, type: "smoothstep", style: { stroke: "#64748b", strokeWidth: 2 } },
          eds
        );
        return updatedEdges;
      });
      if (onProcessesChange) {
        setTimeout(() => {
          onProcessesChange(extractUpdatedProcesses(nodes, updatedEdges));
        }, 0);
      }
    },
    [isValidConnectionHandler, setEdges, onProcessesChange, extractUpdatedProcesses, nodes]
  );

  const onEdgesDeleteHandler = useCallback(
    (deletedEdges) => {
      let remainingEdges = [];
      setEdges((eds) => {
        remainingEdges = eds.filter((e) => !deletedEdges.some((d) => d.id === e.id));
        return remainingEdges;
      });
      if (onProcessesChange) {
        setTimeout(() => {
          onProcessesChange(extractUpdatedProcesses(nodes, remainingEdges));
        }, 0);
      }
    },
    [setEdges, onProcessesChange, extractUpdatedProcesses, nodes]
  );

  const handleSaveClick = () => {
    if (onSaveFlowchart) {
      const updatedProcesses = extractUpdatedProcesses(nodes, edges);
      onSaveFlowchart(updatedProcesses);
    }
  };

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
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-200 shadow-md">
        {canUpdate && (
          <>
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
                  <span>Edit Layout</span>
                </>
              )}
            </button>

            {isEditMode && onSaveFlowchart && (
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#1565c0] text-white shadow-sm hover:bg-[#0f57a6] transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Flowchart</span>
                  </>
                )}
              </button>
            )}
          </>
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        isValidConnection={isEditMode ? isValidConnectionHandler : undefined}
        onReconnectStart={isEditMode ? onReconnectStart : undefined}
        onReconnectEnd={isEditMode ? onReconnectEnd : undefined}
        onReconnect={isEditMode ? onReconnect : undefined}
        onConnect={isEditMode ? onConnect : undefined}
        onEdgesDelete={isEditMode ? onEdgesDeleteHandler : undefined}
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
