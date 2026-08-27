import { apiClient } from "./api-client";

export async function listBoms(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/bom/list-bom", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createBom(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiClient("/bom/add-bom", {
    method: "POST",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function getBom({ id }) {
  return apiClient(`/bom/get-bom?id=${id}`, {
    method: "GET",
  });
}

export async function updateBom(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiClient("/bom/update-bom", {
    method: "PUT",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function deleteBom({ id }) {
  return apiClient(`/bom/delete-bom?id=${id}`, {
    method: "DELETE",
  });
}
