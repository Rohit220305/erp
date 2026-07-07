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

/**
 * POST /auth/restore-session — restores previous session cookies.
 */
export async function restoreSession(token) {
  return apiClient("/auth/restore-session", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

/**
 * POST /auth/reset-password/:id — super admin only.
 * Resets user password directly.
 */
export async function resetPasswordAsAdmin(targetUserId, newPassword) {
  return apiClient(`/auth/reset-password/${targetUserId}`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

/**
 * POST /auth/forgot-password — public
 * Sends OTP to email
 */
export async function forgotPassword(data) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * POST /auth/verify-otp — public
 * Verifies OTP against email
 */
export async function verifyOtp(data) {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * POST /auth/reset-password-otp — public
 * Resets password using OTP
 */
export async function resetPasswordOtp(data) {
  const res = await fetch(`${API_URL}/auth/reset-password-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

