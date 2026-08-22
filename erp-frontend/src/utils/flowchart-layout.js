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
  }));

  const allProcessIds = new Set(normalizedProcesses.map((p) => p.processId));
  const referencedDependencies = new Set();

  normalizedProcesses.forEach((p) => {
    p.dependencies.forEach((depId) => {
      if (allProcessIds.has(depId)) {
        referencedDependencies.add(depId);
      }
    });
  });

  // Root processes: dependencies array is empty or contains no valid process ID in dataset
  const rootProcesses = normalizedProcesses.filter((p) => {
    const validDeps = p.dependencies.filter((d) => allProcessIds.has(d));
    return validDeps.length === 0;
  });

  // Leaf processes: processId is not referenced as a dependency by any other process
  const leafProcesses = normalizedProcesses.filter(
    (p) => !referencedDependencies.has(p.processId)
  );

  const rawNodes = [];
  const rawEdges = [];

  // 1. Start Node
  rawNodes.push({
    id: "start",
    type: "startNode",
    data: { label: "Start" },
    width: CIRCLE_NODE_SIZE,
    height: CIRCLE_NODE_SIZE,
  });

  // 2. Process Nodes
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
    });
  });

  // 3. Finish Node
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

  // 4. Edges from Start -> Root Processes
  rootProcesses.forEach((p) => {
    rawEdges.push({
      id: `start->${p.processId}`,
      source: "start",
      target: String(p.processId),
      ...defaultEdgeOptions,
    });
  });

  // 5. Intermediate Edges (Dependencies -> Current Process)
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

  // 6. Edges from Leaf Processes -> Finish
  leafProcesses.forEach((p) => {
    rawEdges.push({
      id: `${p.processId}->finish`,
      source: String(p.processId),
      target: "finish",
      ...defaultEdgeOptions,
    });
  });

  // 7. Dagre Layout Calculation
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "TB", // Top to Bottom
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
    const pos = {
      x: nodeWithPosition.x - node.width / 2,
      y: nodeWithPosition.y - node.height / 2,
    };
    nodePosMap.set(node.id, nodeWithPosition);
    return {
      ...node,
      position: pos,
    };
  });

  // Assign smart directional handles (top, bottom, left, right) based on computed X/Y coordinates
  const formattedEdges = rawEdges.map((edge) => {
    const sPos = nodePosMap.get(edge.source);
    const tPos = nodePosMap.get(edge.target);

    let sourceHandle = "bottom";
    let targetHandle = "top";

    if (edge.source !== "start" && edge.target !== "finish" && sPos && tPos) {
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

    return {
      ...edge,
      sourceHandle,
      targetHandle,
    };
  });

  return { nodes, edges: formattedEdges };
}
