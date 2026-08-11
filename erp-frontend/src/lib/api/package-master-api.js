import { apiClient } from "./api-client";

export async function listPackages(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/package/list-package", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createPackage(data) {
  return apiClient("/package/add-package", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPackage({ id }) {
  const res = await apiClient(`/package/get-package?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updatePackage(data) {
  return apiClient("/package/update-package", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePackage({ id }) {
  return apiClient(`/package/delete-package?id=${id}`, { method: "DELETE" });
}
