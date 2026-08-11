import { apiClient } from "./api-client";

export async function listWorkCentreCategories(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/work-centre-category/list-work-centre-category", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createWorkCentreCategory(data) {
  return apiClient("/work-centre-category/add-work-centre-category", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWorkCentreCategory({ id }) {
  const res = await apiClient(`/work-centre-category/get-work-centre-category?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateWorkCentreCategory(data) {
  return apiClient("/work-centre-category/update-work-centre-category", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWorkCentreCategory({ id }) {
  return apiClient(`/work-centre-category/delete-work-centre-category?id=${id}`, { method: "DELETE" });
}
