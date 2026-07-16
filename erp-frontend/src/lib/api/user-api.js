import { apiClient } from "./api-client";

export async function listUsers(data = { page: 1, limit: 10, search: "" }) {
  return apiClient("/user/list-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUser(id) {
  const res = await apiClient(`/user/get-user?id=${id}`, { method: "GET" });
  return res?.settings?.data || res?.data || res;
}


export async function createUser(data, photoFile) {
  if (photoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });
    formData.append("profilePhoto", photoFile);
    return apiClient("/user/add-user", { method: "POST", body: formData });
  }
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, val]) => val !== undefined && val !== null && val !== "")
  );
  return apiClient("/user/add-user", {
    method: "POST",
    body: JSON.stringify(cleanedData),
  });
}


export async function updateUser(data, photoFile) {
  if (photoFile) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {  
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, val);
      }
    });
    formData.append("profilePhoto", photoFile);
    
    return apiClient("/user/update-user", { method: "PUT", body: formData });
  }
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, val]) => val !== undefined && val !== null && val !== "")
  );
  console.log("Updating user with data:", cleanedData);
  return apiClient("/user/update-user", {
    method: "PUT",
    body: JSON.stringify(cleanedData),
    });
}


// export async function updateUser(data, photoFile) {
//   // Remove keys with undefined, null or "" values
//   const cleaned = Object.entries(data || {}).reduce((acc, [k, v]) => {
//     if (v !== undefined && v !== null && v !== "") acc[k] = v;
//     return acc;
//   }, {});

//   if (photoFile) {
//     const formData = new FormData();
//     Object.entries(cleaned).forEach(([key, val]) => formData.append(key, val));
//     formData.append("profilePhoto", photoFile);
//     return apiClient("/user/update-user", { method: "PUT", body: formData });
//   }

//   console.log("Updating user with data:", cleaned);
//   return apiClient("/user/update-user", {
//     method: "PUT",
//     body: JSON.stringify(cleaned),
//     headers: { "Content-Type": "application/json" },
//   });
// }
export async function deleteUser(id) {
  return apiClient(`/user/delete-user?id=${id}`, { method: "DELETE" });
}
