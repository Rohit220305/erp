import { apiClient } from "./api-client";

export async function listProductionOrders(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/production-order/list-production-order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createProductionOrder(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiClient("/production-order/add-production-order", {
    method: "POST",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function getProductionOrder({ id }) {
  return apiClient(`/production-order/get-production-order?id=${id}`, {
    method: "GET",
  });
}

export async function updateProductionOrder(formDataOrData) {
  const isFormData = typeof FormData !== "undefined" && formDataOrData instanceof FormData;
  return apiClient("/production-order/update-production-order", {
    method: "PUT",
    body: isFormData ? formDataOrData : JSON.stringify(formDataOrData),
  });
}

export async function deleteProductionOrder({ id }) {
  return apiClient(`/production-order/delete-production-order?id=${id}`, {
    method: "DELETE",
  });
}

export async function cancelProductionOrder(data) {
  return apiClient("/production-order/cancel-order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

