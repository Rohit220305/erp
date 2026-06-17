import { apiClient } from "./api-client";

export async function listGroups(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/group/list-group", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getGroup(id) {
  return apiClient(`/group/get-group?id=${id}`, { method: "GET" });
}

export async function createGroup(data) {
  return apiClient("/group/add-group", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateGroup(data) {
  return apiClient("/group/update-group", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteGroup(id) {
  return apiClient(`/group/delete-group?id=${id}`, { method: "DELETE" });
}
