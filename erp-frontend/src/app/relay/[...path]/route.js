export async function GET(req) {
  return await fetchFunction(req);
}

export async function POST(req) {
  return await fetchFunction(req);
}

export async function PUT(req) {
  return await fetchFunction(req);
}

export async function DELETE(req) {
  return await fetchFunction(req);
}

async function fetchFunction(req) {
  try {
    const { pathname, search } = new URL(req.url);

    const segments = pathname.split("/").filter(Boolean);
    const path = segments.slice(1).join("/");

    const backendBaseUrl = process.env.API_BACKEND_URL || "http://localhost:4000";
    const url = `${backendBaseUrl}/${path}${search}`;

    const contentType = req.headers.get("content-type") || "";
    const isFormData = contentType.includes("multipart/form-data");

    const headers = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    } else {
      headers["Content-Type"] = contentType;
    }

    const cookie = req.headers.get("cookie");
    if (cookie) {
      headers["Cookie"] = cookie;
    }

    let body = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (isFormData) {
        body = await req.arrayBuffer();
      } else {
        body = await req.text();
      }
    }

    const res = await fetch(url, {
      method: req.method,
      headers,
      body: body,
      cache: "no-store",
    });

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: "Failed to fetch" };
      }

      const response = Response.json(
        errorData,
        { status: res.status }
      );

      if (res.headers.getSetCookie) {
        res.headers.getSetCookie().forEach((c) => {
          response.headers.append("Set-Cookie", c);
        });
      }
      return response;
    }

    const data = await res.json();
    const response = Response.json(data);

    if (res.headers.getSetCookie) {
      res.headers.getSetCookie().forEach((c) => {
        response.headers.append("Set-Cookie", c);
      });
    }

    return response;
  } catch (error) {
    console.error("Relay proxy error:", error);
    return Response.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
