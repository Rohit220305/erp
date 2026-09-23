import { apiClient } from "./api-client";

export async function suggestBatch(productionOrderId) {
  return apiClient(`/production-batch/suggest-batch?productionOrderId=${productionOrderId}`, {
    method: "GET",
  });
}

export async function addProductionBatch(data) {
  return apiClient("/production-batch/add-production-batch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listProductionBatch(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/production-batch/list-production-batch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProductionBatchDetails({ id }) {
  return apiClient(`/production-batch/get-production-batch?id=${id}`, {
    method: "GET",
  });
}

export async function deleteProductionBatch({ id }) {
  return apiClient(`/production-batch/delete-production-batch?id=${id}`, {
    method: "DELETE",
  });
}

export async function getProcessDetails(batchId, processExecutionId) {
  return apiClient(`/production-batch/get-process-details?batchId=${batchId}&processExecutionId=${processExecutionId}`, {
    method: "GET",
  });
}

export async function addProcessLog(data) {
  return apiClient("/production-batch/add-process-log", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function startProcess(data) {
  return apiClient("/production-batch/start-process", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function pauseProcess(data) {
  return apiClient("/production-batch/pause-process", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resumeProcess(data) {
  return apiClient("/production-batch/resume-process", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function finishProcess(data) {
  return apiClient("/production-batch/finish-process", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markBatchCompleted(data) {
  return apiClient("/production-batch/mark-batch-completed", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelProductionBatch(data) {
  return apiClient("/production-batch/cancel-batch", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


