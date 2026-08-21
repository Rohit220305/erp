import { apiClient } from "./api-client";

export async function listStorages(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/storage/list-storage", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createStorage(data, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("storageImage", imageFile);
    return apiClient("/storage/add-storage", { method: "POST", body: formData });
  }
  return apiClient("/storage/add-storage", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getStorage({ id }) {
  const res = await apiClient(`/storage/get-storage?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateStorage(data, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("storageImage", imageFile);
    return apiClient("/storage/update-storage", { method: "PUT", body: formData });
  }
  return apiClient("/storage/update-storage", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteStorage({ id }) {
  return apiClient(`/storage/delete-storage?id=${id}`, { method: "DELETE" });
}
