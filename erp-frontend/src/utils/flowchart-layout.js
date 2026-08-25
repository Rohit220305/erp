import dagre from "@dagrejs/dagre";
import { MarkerType } from "@xyflow/react";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 54;
const CIRCLE_NODE_SIZE = 64;

export function buildFlowchartGraph(processes = []) {
  if (!Array.isArray(processes) || processes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const normalizedProcesses = processes.map((p, idx) => ({
    processId: Number(p.processId),
    processName: p.processName || `Process #${p.processId}`,
    sequenceNo: p.sequenceNo || idx + 1,
    dependencies: (p.dependencies || []).map(Number),
    nodePosition: p.nodePosition || null,
    handleConfig: p.handleConfig || null,
  }));

  const allProcessIds = new Set(normalizedProcesses.map((p) => p.processId));
  const processMap = new Map(normalizedProcesses.map((p) => [String(p.processId), p]));
  const referencedDependencies = new Set();

  normalizedProcesses.forEach((p) => {
    p.dependencies.forEach((depId) => {
      if (allProcessIds.has(depId)) {
        referencedDependencies.add(depId);
      }
    });
  });

  const rootProcesses = normalizedProcesses.filter((p) => {
    const validDeps = p.dependencies.filter((d) => allProcessIds.has(d));
    return validDeps.length === 0;
  });

  const leafProcesses = normalizedProcesses.filter(
    (p) => !referencedDependencies.has(p.processId)
  );

  const rawNodes = [];
  const rawEdges = [];

  rawNodes.push({
    id: "start",
    type: "startNode",
    data: { label: "Start" },
    width: CIRCLE_NODE_SIZE,
    height: CIRCLE_NODE_SIZE,
  });

  normalizedProcesses.forEach((p) => {
    rawNodes.push({
      id: String(p.processId),
      type: "processCardNode",
      data: {
        processId: p.processId,
        processName: p.processName,
        sequenceNo: p.sequenceNo,
      },
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      savedPosition: p.nodePosition,
    });
  });

  rawNodes.push({
    id: "finish",
    type: "finishNode",
    data: { label: "Finish!" },
    width: CIRCLE_NODE_SIZE,
    height: CIRCLE_NODE_SIZE,
  });

  const defaultEdgeOptions = {
    type: "smoothstep",
    animated: false,
    style: { stroke: "#64748b", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: "#64748b",
    },
  };

  rootProcesses.forEach((p) => {
    rawEdges.push({
      id: `start->${p.processId}`,
      source: "start",
      target: String(p.processId),
      ...defaultEdgeOptions,
    });
  });

  normalizedProcesses.forEach((p) => {
    p.dependencies.forEach((depId) => {
      if (allProcessIds.has(depId)) {
        rawEdges.push({
          id: `${depId}->${p.processId}`,
          source: String(depId),
          target: String(p.processId),
          ...defaultEdgeOptions,
        });
      }
    });
  });

  leafProcesses.forEach((p) => {
    rawEdges.push({
      id: `${p.processId}->finish`,
      source: String(p.processId),
      target: "finish",
      ...defaultEdgeOptions,
    });
  });

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "TB",  
    nodesep: 60,
    ranksep: 70,
    marginx: 50,
    marginy: 50,
  });

  rawNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node.width, height: node.height });
  });

  rawEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const nodePosMap = new Map();

  const nodes = rawNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const dagrePos = {
      x: nodeWithPosition.x - node.width / 2,
      y: nodeWithPosition.y - node.height / 2,
    };

    const finalPos =
      node.savedPosition &&
      typeof node.savedPosition.x === "number" &&
      typeof node.savedPosition.y === "number"
        ? node.savedPosition
        : dagrePos;

    nodePosMap.set(node.id, {
      x: finalPos.x + node.width / 2,
      y: finalPos.y + node.height / 2,
    });

    const { savedPosition, ...cleanNode } = node;

    return {
      ...cleanNode,
      position: finalPos,
    };
  });

  const formattedEdges = rawEdges.map((edge) => {
    const targetProc = processMap.get(edge.target);
    const savedHandleConfig = targetProc?.handleConfig?.[edge.source];

    let sourceHandle = "bottom";
    let targetHandle = "top";

    if (savedHandleConfig?.sourceHandle && savedHandleConfig?.targetHandle) {
      sourceHandle = savedHandleConfig.sourceHandle;
      targetHandle = savedHandleConfig.targetHandle;
    } else if (edge.source !== "start" && edge.target !== "finish") {
      const sPos = nodePosMap.get(edge.source);
      const tPos = nodePosMap.get(edge.target);

      if (sPos && tPos) {
        const dx = tPos.x - sPos.x;
        const dy = tPos.y - sPos.y;

        if (dx > 70) {
          sourceHandle = "right";
          targetHandle = Math.abs(dy) < 40 ? "target-left" : "top";
        } else if (dx < -70) {
          sourceHandle = "left";
          targetHandle = Math.abs(dy) < 40 ? "target-right" : "top";
        } else {
          sourceHandle = "bottom";
          targetHandle = "top";
        }
      }
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });

  return { nodes, edges: formattedEdges };
}
