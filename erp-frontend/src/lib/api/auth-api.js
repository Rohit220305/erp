import { apiClient, API_URL } from "./api-client";


export async function loginUser(data) {
 
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function refreshToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}


export async function logoutUser() {
  return apiClient("/auth/logout", { method: "POST" });
}


export async function loginAsUser(targetUserId) {
  return apiClient(`/auth/login-as-user/${targetUserId}`, { method: "POST" });
}

export async function changePassword(data) {
  return apiClient("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export async function restoreSession(token) {
  return apiClient("/auth/restore-session", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function resetPasswordAsAdmin(targetUserId, newPassword) {
  return apiClient(`/auth/reset-password/${targetUserId}`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}


export async function forgotPassword(data) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}


export async function verifyOtp(data) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}


export async function resetPasswordOtp(data) {
  const res = await fetch(`${API_URL}/auth/reset-password-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

