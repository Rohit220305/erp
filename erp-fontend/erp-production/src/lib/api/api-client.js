
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;

/**
 * Central fetch wrapper.
 * - Always sends httpOnly cookies (`credentials: 'include'`)
 * - On server (SSR): forwards the incoming request cookies via next/headers
 *   because `credentials: 'include'` is browser-only and does not work in Node.js fetch
 * - On 401: attempts silent token refresh once, then retries
 * - On second 401 (refresh failed): redirects to /login (client) or returns null (server)
 */
export async function apiClient(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const isServer = typeof window === "undefined";

  const makeRequest = async () => {
    const isFormData = options.body instanceof FormData;

    // On the server, `credentials: "include"` is silently ignored by Node.js fetch.
    // We must read the browser's cookies from the incoming Next.js request and forward
    // them explicitly as a Cookie header so the backend can authenticate the request.
    let serverCookieHeader = {};
    if (isServer) {
      try {
        // Dynamic import avoids bundling next/headers into the client bundle.
        // This branch is only ever reached on the server, so the import is safe.
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const rawCookies = cookieStore.toString();
        if (rawCookies) serverCookieHeader = { Cookie: rawCookies };
      } catch {
        // cookies() throws if called outside a request context (e.g., during build)
      }
    }

    return fetch(url, {
      ...options,
      credentials: "include",
      headers: isFormData
        ? { ...serverCookieHeader, ...options.headers }
        : { "Content-Type": "application/json", ...serverCookieHeader, ...options.headers },
    });
  };

  let res = await makeRequest();

  if (res.status === 401 && !isRefreshing) {  
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        // Retry original request with new cookies
        res = await makeRequest();
      } else {
        // Refresh failed — redirect to login on client, return null on server
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return null;
      }
    } finally {
      isRefreshing = false;
    }
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return res.json();
}

export { API_URL };

