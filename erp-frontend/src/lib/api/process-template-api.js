import { apiClient } from "./api-client";

export async function listProcessTemplates(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/process-template/list-process-template", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createProcessTemplate(data) {
  return apiClient("/process-template/add-process-template", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProcessTemplate({ id }) {
  const res = await apiClient(`/process-template/get-process-template?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateProcessTemplate(data) {
  return apiClient("/process-template/update-process-template", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProcessTemplate({ id }) {
  return apiClient(`/process-template/delete-process-template?id=${id}`, {
    method: "DELETE",
  });
}
