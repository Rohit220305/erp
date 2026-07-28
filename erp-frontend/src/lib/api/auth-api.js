import { apiClient } from "./api-client";

export async function loginUser(data) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function refreshToken() {
  return apiClient("/auth/refresh", {
    method: "POST",
  });
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
  return apiClient("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(data) {
  return apiClient("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function resetPasswordOtp(data) {
  return apiClient("/auth/reset-password-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function selectProfile(selectionToken, groupId) {
  return apiClient("/auth/select-profile", {
    method: "POST",
    body: JSON.stringify({ selectionToken, groupId }),
  });
}

export async function switchProfile(groupId) {
  return apiClient("/auth/switch-profile", {
    method: "POST",
    body: JSON.stringify({ groupId }),
  });
}
