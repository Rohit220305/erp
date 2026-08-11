import { apiClient } from "./api-client";

export async function listItemUoms(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/item-uom/list-item-uom", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createItemUom(data) {
  return apiClient("/item-uom/add-item-uom", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getItemUom({ id }) {
  const res = await apiClient(`/item-uom/get-item-uom?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateItemUom(data) {
  return apiClient("/item-uom/update-item-uom", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteItemUom({ id }) {
  return apiClient(`/item-uom/delete-item-uom?id=${id}`, { method: "DELETE" });
}
