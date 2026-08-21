import { apiClient } from "./api-client";

export async function listItemCategories(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/item-category/list-item-category", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createItemCategory(data) {
  return apiClient("/item-category/add-item-category", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getItemCategory({ id }) {
  const res = await apiClient(`/item-category/get-item-category?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateItemCategory(data) {
  return apiClient("/item-category/update-item-category", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteItemCategory({ id }) {
  return apiClient(`/item-category/delete-item-category?id=${id}`, { method: "DELETE" });
}
