import { apiClient } from "./api-client";

export async function listManufacturers(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/manufacturer/list-manufacturer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createManufacturer(data) {
  return apiClient("/manufacturer/add-manufacturer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getManufacturer({ id }) {
  const res = await apiClient(`/manufacturer/get-manufacturer?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateManufacturer(data) {
  return apiClient("/manufacturer/update-manufacturer", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteManufacturer({ id }) {
  return apiClient(`/manufacturer/delete-manufacturer?id=${id}`, { method: "DELETE" });
}
