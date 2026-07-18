import { apiClient } from "./api-client";

export async function listCurrencies(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/currency/list-currency", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createCurrency(data) {
  return apiClient("/currency/add-currency", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCurrency({ id }) {
  console.log("getCurrency id", id);
  const res = await apiClient(`/currency/get-currency?id=${id}`, {
    method: "GET",
  });
  return res;
}

export async function updateCurrency(data) {
  return apiClient("/currency/update-currency", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCurrency({ id }) {
  return apiClient(`/currency/delete-currency?id=${id}`, { method: "DELETE" });
}
