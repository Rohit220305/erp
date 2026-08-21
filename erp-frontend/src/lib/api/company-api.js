import { apiClient } from "./api-client";

export async function listCompanies(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/company/list-company", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCompany(data, logoFile) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      formData.append(key, val.length ? val.join(",") : "");
    } else if (val !== undefined && val !== null && val !== "") {
      formData.append(key, String(val));
    }
  });
  if (logoFile) {
    formData.append("companyLogo", logoFile);
  }
  return apiClient("/company/add-company", { method: "POST", body: formData });
}

export async function getCompany(id) {
  const res = await apiClient(`/company/get-company?id=${id}`, {
    method: "GET",
  });
  return res?.settings?.data || res?.data || res;
}

export async function updateCompany(data, logoFile) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (Array.isArray(val)) {
      formData.append(key, val.length ? val.join(",") : "");
    } else if (val !== undefined && val !== null && val !== "") {
      formData.append(key, String(val));
    }
  });
  if (logoFile) {
    formData.append("companyLogo", logoFile);
  }
  return apiClient("/company/update-company", { method: "PUT", body: formData });
}

export async function deleteCompany(id) {
  return apiClient(`/company/delete-company?id=${id}`, { method: "DELETE" });
}