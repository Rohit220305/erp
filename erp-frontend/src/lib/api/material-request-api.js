import { apiClient } from "./api-client";

export async function suggestMaterialRequest(query) {
  const qs = new URLSearchParams(query).toString();
  return apiClient(`/material-request/suggest-material-request?${qs}`, {
    method: "GET",
  });
}

export async function createMaterialRequest(data) {
  return apiClient("/material-request/create-material-request", {
    method: "POST",
    body: data,
  });
}

export async function listMaterialRequests(data = {}) {
  return apiClient("/material-request/list-material-request", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function markMaterialRequestDelivered(data = {}) {
  return apiClient("/material-request/mark-material-request-delivered", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function cancelMaterialRequest(data = {}) {
  return apiClient("/material-request/cancel-material-request", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
