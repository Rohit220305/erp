const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(data) {
  console.log("Logging in with data:", data); // Debug log
  console.log(API_URL);

  const response = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}


export async function getCompanies(data = { page: 1, limit: 10, search: "" }) {
  console.log("Fetching companies with body data:", data); // Debug log

  const response = await fetch(`${API_URL}/company/list-company`, {
    method: "POST", // Changed to POST to allow a body
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}
