import { apiClient } from "./api-client";

export async function listProcesses(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/process/list-process", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createProcess(data, imageFile, pdfFile) {
  if (imageFile || pdfFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });
    if (imageFile) formData.append("imageUrl", imageFile);
    if (pdfFile) formData.append("instructionPdfUrl", pdfFile);
    return apiClient("/process/add-process", { method: "POST", body: formData });
  }
  return apiClient("/process/add-process", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProcess({ id }) {
  const res = await apiClient(`/process/get-process?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateProcess(data, imageFile, pdfFile) {
  if (imageFile || pdfFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });
    if (imageFile) formData.append("imageUrl", imageFile);
    if (pdfFile) formData.append("instructionPdfUrl", pdfFile);
    return apiClient("/process/update-process", { method: "PUT", body: formData });
  }
  return apiClient("/process/update-process", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProcess({ id }) {
  return apiClient(`/process/delete-process?id=${id}`, { method: "DELETE" });
}
