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

export async function listCompanies(data = { page: 1, limit: 10, search: "" }) {
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

export async function createCompany(data) {
  console.log("Creating company with data:", data); // Debug log

  const response = await fetch(`${API_URL}/company/add-company`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

export async function getCompany(id) {
  console.log("Fetching company with ID:", id); // Debug log

  const response = await fetch(`${API_URL}/company/get-company?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log("Get company response:", data?.settings?.data); // Debug log

  return data?.settings?.data;
}

 