import { apiClient } from "./api-client";

export async function suggestMaterialRequest(query) {
  const qs = new URLSearchParams(query).toString();
  return apiClient(`/material-request/suggest-material-request?${qs}`, {
    method: "GET",
  });
}

export async function getMaterialRequest(params) {
  const id = typeof params === "object" ? params?.id : params;
  return apiClient(`/material-request/get-material-request?id=${id}`, {
    method: "GET",
  });
}

export async function createMaterialRequest(payload) {
  const body = payload instanceof FormData 
      ? payload 
      : (typeof payload === "string" ? payload : JSON.stringify(payload));

  return apiClient("/material-request/create-material-request", {
    method: "POST",
    body,
  });
}

export async function listMaterialRequests(data = { page: 1, limit: 10, search: "" }) {
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

export async function deleteMaterialRequest(params) {
  const id = typeof params === "object" ? params?.id : params;
  return cancelMaterialRequest({ id });
}
