import { apiClient } from "./api-client";

export async function listItems(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/item/list-item", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createItem(formData) {
  return apiClient("/item/add-item", {
    method: "POST",
    body: formData,
  });
}

export async function getItem({ id }) {
  const res = await apiClient(`/item/get-item?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateItem(formData) {
  return apiClient("/item/update-item", {
    method: "PUT",
    body: formData,
  });
}

export async function deleteItem({ id }) {
  return apiClient(`/item/delete-item?id=${id}`, { method: "DELETE" });
}
