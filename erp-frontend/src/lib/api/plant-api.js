import { apiClient } from "./api-client";

export async function listPlants(data = { page: 1, limit: 100, search: "" }) {
  return apiClient("/plant/list-plant", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPlant({ id }) {
  return apiClient(`/plant/get-plant?id=${id}`, {
    method: "GET",
  });
}

export async function createPlant(data) {
  return apiClient("/plant/add-plant", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePlant(data) {
  return apiClient("/plant/update-plant", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePlant({ id }) {
  return apiClient(`/plant/delete-plant?id=${id}`, {
    method: "DELETE",
  });
}
