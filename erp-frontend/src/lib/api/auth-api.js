import { apiClient, API_URL } from "./api-client";

/**
 * POST /auth/login — returns { success, message, data: safeUser }
 * Tokens are set as httpOnly cookies by the server.
 */
export async function loginUser(data) {
  // Login is public — no auth cookie needed, but we still use credentials
  // to allow the server to set cookies on the response.
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * POST /auth/refresh — silently rotates access + refresh tokens.
 * Called automatically by api-client on 401.
 */
export async function refreshToken() {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}

/**
 * POST /auth/logout — clears both httpOnly cookies server-side.
 */
export async function logoutUser() {
  return apiClient("/auth/logout", { method: "POST" });
}

/**
 * POST /auth/login-as-user/:id — super admin only.
 * Issues fresh cookie pair for target user.
 */
export async function loginAsUser(targetUserId) {
  return apiClient(`/auth/login-as-user/${targetUserId}`, { method: "POST" });
}

/**
 * POST /auth/change-password — authenticated users only.
 * Validates current password, sets new password.
 */
export async function changePassword(data) {
  return apiClient("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

