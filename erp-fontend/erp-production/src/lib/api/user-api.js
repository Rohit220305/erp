const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAdmin(id) {
  console.log("Fetching admin with ID:", id);

  const response = await fetch(`${API_URL}/admin/get-user?id=${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  return data?.settings?.data;
}
