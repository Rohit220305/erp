import { apiClient } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function listCompanies(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/company/list-company", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * POST /company/add-company
 * Sends FormData when a logo file is provided (required for multer),
 * otherwise sends JSON.
 */
export async function createCompany(data, logoFile) {
  if (logoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("companyLogo", logoFile);
    return apiClient("/company/add-company", { method: "POST", body: formData });
  }
  return apiClient("/company/add-company", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCompany(id) {
  const res = await apiClient(`/company/get-company?id=${id}`, {
    method: "GET",
  });
  return res?.settings?.data || res?.data || res;
}


export async function updateCompany(data, logoFile) {
  
  if (logoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });
    formData.append("companyLogo", logoFile);
    return apiClient("/company/update-company", { method: "PUT", body: formData });
  }
  return apiClient("/company/update-company", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCompany(id) {
  return apiClient(`/company/delete-company?id=${id}`, { method: "DELETE" });
}