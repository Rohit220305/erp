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
