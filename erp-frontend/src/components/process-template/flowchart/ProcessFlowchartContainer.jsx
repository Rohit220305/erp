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
  readOnly = false,
  disableScrollZoom = false,
  containerClassName = "",
  mode = "template",
}) {
  const { can } = useAuth();
  const canUpdate = !readOnly && can(
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
        return {
          ...node,
          data: {
            ...node.data,
            ...(node.type === "processCardNode" ? { onProcessClick: onOpenProcessDrawer } : {}),
            mode,
          },
        };
      });
    },
    [onOpenProcessDrawer, mode]
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
          dependencies: p.dependencies || [],
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

  const onReconnectEnd = useCallback(
    (_, edge) => {
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
    },
    [setEdges, onProcessesChange, extractUpdatedProcesses, nodes]
  );

  const isValidConnectionHandler = useCallback((connection) => {
    const activeEdge = reconnectingEdgeRef.current;
    if (activeEdge) {
      return (
        String(connection.source) === String(activeEdge.source) &&
        String(connection.target) === String(activeEdge.target)
      );
    }
    return false;
  }, []);

  const onReconnect = useCallback(
    (oldEdge, newConnection) => {
      if (
        String(oldEdge.source) !== String(newConnection.source) ||
        String(oldEdge.target) !== String(newConnection.target)
      ) {
        toast.error(
          "Edge dependencies cannot be changed in flowchart. Edit dependencies in Step 2 process grid.",
          { id: "flowchart-val-err" }
        );
        return;
      }
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
    [setEdges, onProcessesChange, extractUpdatedProcesses, nodes]
  );

  const onConnect = useCallback(() => {
    toast.error(
      "New dependencies cannot be created in flowchart. Edit dependencies in Step 2 process grid.",
      { id: "flowchart-val-err" }
    );
  }, []);

  const onEdgesDeleteHandler = useCallback(() => {
    toast.error(
      "Edges cannot be deleted in flowchart. Edit dependencies in Step 2 process grid.",
      { id: "flowchart-val-err" }
    );
  }, []);

  const handleSaveClick = () => {
    if (onSaveFlowchart) {
      const updatedProcesses = extractUpdatedProcesses(nodes, edges);
      onSaveFlowchart(updatedProcesses);
      setIsEditMode(false);
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
    <div className={`relative w-full bg-slate-50 rounded-xl border border-gray-200 overflow-hidden shadow-inner ${containerClassName || "h-[620px]"}`}>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-200 shadow-md">
        {isEditMode && (
          <button
            type="button"
            onClick={handleResetLayout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            title="Reset layout to automatic auto-aligned positions"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
        {/* Edit Layout */}
        {canUpdate && (
          <>
            {!isEditMode && (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                <Lock size={14} />
                <span>Edit </span>
              </button>
            )}

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
                    <span>Save </span>
                  </>
                )}
              </button>
            )}
          </>
        )}
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
        panOnScroll={!disableScrollZoom}
        panOnDrag={true}
        zoomOnScroll={!disableScrollZoom}
        zoomOnPinch={!disableScrollZoom}
        preventScrolling={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={18} size={1.5} color="#94a3b8" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  );
}
