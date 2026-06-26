
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;


export async function apiClient(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const isServer = typeof window === "undefined";

  const makeRequest = async () => {
    const isFormData = options.body instanceof FormData;

    
    let serverCookieHeader = {};
    if (isServer) {
      try {
        
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
          localStorage.removeItem("sessionStack");
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        } else {
          try {
            const { redirect } = await import("next/navigation");
            redirect("/login");
          } catch (err) {
            if (err && err.message && err.message.includes("NEXT_REDIRECT")) {
              throw err;
            }
          }
        }
        return null;
      }
    } finally {
      isRefreshing = false;
    }
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sessionStack");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    } else {
      try {
        const { redirect } = await import("next/navigation");
        redirect("/login");
      } catch (err) {
        if (err && err.message && err.message.includes("NEXT_REDIRECT")) {
          throw err;
        }
      }
    }
    return null;
  }

  return res.json();
}

export { API_URL };

