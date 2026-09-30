import { apiClient } from "./api-client";

export async function listCustomerCompanyUsers(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/customer-company/list-customer-company-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCustomerCompanyUser(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiClient("/customer-company/add-customer-company-user", {
    method: "POST",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function getCustomerCompanyUser({ id }) {
  return apiClient(`/customer-company/get-customer-company-user?id=${id}`, {
    method: "GET",
  });
}

export async function updateCustomerCompanyUser(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiClient("/customer-company/update-customer-company-user", {
    method: "PUT",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function deleteCustomerCompanyUser({ id }) {
  return apiClient(`/customer-company/delete-customer-company-user?id=${id}`, {
    method: "DELETE",
  });
}
