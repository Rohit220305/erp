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

export async function getGroups(data = { page: 1, limit: 100, search: "" }) {
  return listGroups(data);
}

export async function getGroupById(id) {
  return getGroup(id);
}

export async function saveGroupWithCapabilities(payload) {
  // console.log('Saving group with capabilities:', payload);
  return apiClient("/group/save-with-capabilities", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateGroupWithCapabilities(payload) {
  console.log('Updating group with capabilities:', payload);
  
  return apiClient("/group/update-with-capabilities", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getCapabilityMatrix(groupId) {
  const url = groupId
    ? `/group-capability/matrix?groupId=${groupId}`
    : "/group-capability/matrix";
  return apiClient(url, { method: "GET" });
}

