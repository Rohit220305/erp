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
