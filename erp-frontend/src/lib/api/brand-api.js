import { apiClient } from "./api-client";

export async function listBrands(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/brand/list-brand", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createBrand(data, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("brandImage", imageFile);
    return apiClient("/brand/add-brand", { method: "POST", body: formData });
  }
  return apiClient("/brand/add-brand", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBrand({ id }) {
  const res = await apiClient(`/brand/get-brand?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateBrand(data, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("brandImage", imageFile);
    return apiClient("/brand/update-brand", { method: "PUT", body: formData });
  }
  return apiClient("/brand/update-brand", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBrand({ id }) {
  return apiClient(`/brand/delete-brand?id=${id}`, { method: "DELETE" });
}
