const RELAY_URL = process.env.NEXT_PUBLIC_RELAY_URL || "/relay";
const BACKEND_URL = process.env.API_BACKEND_URL || "http://localhost:4000";

let clientRefreshPromise = null;

export async function apiClient(path, options = {}) {
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? BACKEND_URL : RELAY_URL;
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

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
      }
    }

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
      const refreshUrl = `${RELAY_URL}/auth/refresh`;
      if (!clientRefreshPromise) {
        clientRefreshPromise = fetch(refreshUrl, {
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
        res = await makeRequest();
      } catch (err) {
        localStorage.removeItem("sessionStack");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        return null;
      }
    } else {
      try {
        let serverCookieHeader = {};
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          const rawCookies = cookieStore.toString();
          if (rawCookies) serverCookieHeader = { Cookie: rawCookies };
        } catch { }

        const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: serverCookieHeader
        });

        if (refreshRes.ok) {
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

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    return { success: 0, message: "Invalid server response" };
  }
}

export { RELAY_URL, RELAY_URL as API_URL };
