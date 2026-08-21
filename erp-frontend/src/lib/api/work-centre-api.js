import { apiClient } from "./api-client";

export async function listWorkCentres(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/work-centre/list-work-centre", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createWorkCentre(data, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("imageUrl", imageFile);
    return apiClient("/work-centre/add-work-centre", { method: "POST", body: formData });
  }
  return apiClient("/work-centre/add-work-centre", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWorkCentre({ id }) {
  const res = await apiClient(`/work-centre/get-work-centre?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateWorkCentre(data, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("imageUrl", imageFile);
    return apiClient("/work-centre/update-work-centre", { method: "PUT", body: formData });
  }
  return apiClient("/work-centre/update-work-centre", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteWorkCentre({ id }) {
  return apiClient(`/work-centre/delete-work-centre?id=${id}`, { method: "DELETE" });
}
