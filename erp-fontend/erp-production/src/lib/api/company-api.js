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

export async function createCompany(data) {
  return apiClient("/company/add-company", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCompany(id) {
  const res = await apiClient(`/company/get-company?id=${id}`, {
    method: "GET",
  }); 
  console.log("getCompany response:", res); // Debug log
  return res?.settings?.data || res?.data || res;
}

export async function updateCompany(data) {
  return apiClient("/company/update-company", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}