import { apiClient } from "./api-client";

export async function listUsers(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/user/list-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUser(id) {
  const res = await apiClient(`/user/get-user?id=${id}`, { method: "GET" });
  return res?.settings?.data || res?.data || res;
}

/**
 * POST /user/add-user — supports profile photo upload via FormData
 */
export async function createUser(data, photoFile) {
  if (photoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });
    formData.append("profilePhoto", photoFile);
    return apiClient("/user/add-user", { method: "POST", body: formData });
  }
  return apiClient("/user/add-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT /user/update-user — supports profile photo upload via FormData
 */
export async function updateUser(data, photoFile) {
  if (photoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });
    formData.append("profilePhoto", photoFile);
    
    return apiClient("/user/update-user", { method: "PUT", body: formData });
  }
  return apiClient("/user/update-user", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id) {
  return apiClient(`/user/delete-user?id=${id}`, { method: "DELETE" });
}
