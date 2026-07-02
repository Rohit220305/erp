const API_URL = process.env.NEXT_PUBLIC_API_URL;

let clientRefreshPromise = null;

export async function apiClient(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const isServer = typeof window === "undefined";

  const makeRequest = async (overrideHeaders = {}) => {
    const isFormData = options.body instanceof FormData;

    let serverCookieHeader = {};
    if (isServer) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const rawCookies = cookieStore.toString();
        if (rawCookies) serverCookieHeader = { Cookie: rawCookies };
      } catch {
        // cookies() throws if called outside a request context
      }
    }
    
    // Merge server cookies with any override headers (like new cookies after refresh)
    const finalHeaders = { ...serverCookieHeader, ...overrideHeaders, ...options.headers };

    return fetch(url, {
      ...options,
      credentials: "include",
      headers: isFormData
        ? finalHeaders
        : { "Content-Type": "application/json", ...finalHeaders },
    });
  };

  let res = await makeRequest();

  if (res.status === 401) {
    if (!isServer) {
      if (!clientRefreshPromise) {
        clientRefreshPromise = fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        }).then(refreshRes => {
          if (!refreshRes.ok) {
            throw new Error("Refresh failed");
          }
          return refreshRes;
        }).finally(() => {
          clientRefreshPromise = null;
        });
      }

      try {
        await clientRefreshPromise;
        // Retry original request with new cookies
        res = await makeRequest();
      } catch (err) {
        localStorage.removeItem("sessionStack");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return null;
      }
    } else {
      // Server side refresh
      try {
        let serverCookieHeader = {};
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          const rawCookies = cookieStore.toString();
          if (rawCookies) serverCookieHeader = { Cookie: rawCookies };
        } catch {}

        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: serverCookieHeader
        });

        if (refreshRes.ok) {
          // Extract new cookies from set-cookie header if needed
          const setCookie = refreshRes.headers.get("set-cookie");
          const overrideHeaders = setCookie ? { Cookie: setCookie } : {};
          res = await makeRequest(overrideHeaders);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (err) {
        try {
          const { redirect } = await import("next/navigation");
          redirect("/login");
        } catch (e) {
          if (e && e.message && e.message.includes("NEXT_REDIRECT")) {
            throw e;
          }
        }
        return null;
      }
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

