
export function wouldCreateCycle(edges, sourceId, targetId) {
  const adj = new Map();

  edges.forEach((edge) => {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source).push(edge.target);
  });

  if (!adj.has(sourceId)) adj.set(sourceId, []);
  adj.get(sourceId).push(targetId);

  const visited = new Set();
  const stack = [targetId];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === sourceId) {
      return true;
    }

    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return false;
}

export function validateConnection(connection, nodes, edges, oldEdgeId = null) {
  const { source, target } = connection;

  if (source === target) {
    return {
      isValid: false,
      reason: "Self-loops are not allowed.",
    };
  }

  if (source === "finish") {
    return {
      isValid: false,
      reason: "The Finish node cannot have outgoing connections.",
    };
  }

  if (target === "finish") {
    return {
      isValid: false,
      reason: "Connections to Finish are automatic. You cannot manually connect to Finish.",
    };
  }

  if (source === "start") {
    return {
      isValid: false,
      reason: "Connections from Start are automatic. You cannot manually connect from Start.",
    };
  }

  const isDuplicate = edges.some(
    (e) => e.id !== oldEdgeId && e.source === source && e.target === target
  );
  if (isDuplicate) {
    return {
      isValid: false,
      reason: "This connection already exists.",
    };
  }

  const sourceNode = nodes.find((n) => String(n.id) === String(source));
  const targetNode = nodes.find((n) => String(n.id) === String(target));

  const sourceSeq = sourceNode?.data?.sequenceNo;
  const targetSeq = targetNode?.data?.sequenceNo;

  if (sourceSeq !== undefined && targetSeq !== undefined) {
    if (Number(targetSeq) <= Number(sourceSeq)) {
      const sourceName = sourceNode?.data?.label || `Step #${sourceSeq}`;
      const targetName = targetNode?.data?.label || `Step #${targetSeq}`;
      return {
        isValid: false,
        reason: `Sequence Violation: Step #${targetSeq} (${targetName}) cannot depend on Step #${sourceSeq} (${sourceName}) because it comes later or equal in sequence order.`,
      };
    }
  }

  if (wouldCreateCycle(edges, source, target)) {
    return {
      isValid: false,
      reason: "Invalid Connection: This would create a circular dependency loop.",
    };
  }

  return { isValid: true };
}
