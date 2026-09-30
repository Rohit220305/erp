import { apiClient } from "./api-client";

export async function listCustomerCompanies(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/customer-company/list-customer-company", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCustomerCompany(data, logoFile, ownerFile) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object" && data[key] !== null) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  if (logoFile) formData.append("logo", logoFile);
  if (ownerFile) formData.append("ownerProfileImage", ownerFile);

  return apiClient("/customer-company/add-customer-company", {
    method: "POST",
    body: formData,
  });
}

export async function getCustomerCompany({ id }) {
  return apiClient(`/customer-company/get-customer-company?id=${id}`, {
    method: "GET",
  });
}

export async function updateCustomerCompany(data, logoFile, ownerFile) {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object" && data[key] !== null) {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  if (logoFile) formData.append("logo", logoFile);
  if (ownerFile) formData.append("ownerProfileImage", ownerFile);

  return apiClient("/customer-company/update-customer-company", {
    method: "PUT",
    body: formData,
  });
}

export async function deleteCustomerCompany({ id }) {
  return apiClient(`/customer-company/delete-customer-company?id=${id}`, {
    method: "DELETE",
  });
}
