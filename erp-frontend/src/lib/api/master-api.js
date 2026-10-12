import { apiClient } from "./api-client";

export async function listMasterRecords(moduleSlug, data = { page: 1, limit: 10, search: "" }) {
  return apiClient(`/master/${moduleSlug}/list`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createMasterRecord(moduleSlug, data) {
  return apiClient(`/master/${moduleSlug}/add`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMasterRecord(moduleSlug, param) {
  const id = typeof param === "object" && param !== null ? param.id : param;
  const res = await apiClient(`/master/${moduleSlug}/get?id=${id}`, {
    method: "GET",
  });
  return res?.settings?.data || res?.data || res;
}

export async function updateMasterRecord(moduleSlug, data) {
  return apiClient(`/master/${moduleSlug}/update`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMasterRecord(moduleSlug, param) {
  const id = typeof param === "object" && param !== null ? param.id : param;
  return apiClient(`/master/${moduleSlug}/delete?id=${id}`, {
    method: "DELETE",
  });
}

export function createMasterModuleApi(moduleSlug) {
  return {
    list: (params) => listMasterRecords(moduleSlug, params),
    create: (data) => createMasterRecord(moduleSlug, data),
    update: async (idOrData, maybeData) => {
      if (maybeData !== undefined) {
        return updateMasterRecord(moduleSlug, { id: idOrData, ...maybeData });
      }
      return updateMasterRecord(moduleSlug, idOrData);
    },
    getOne: async (idOrObj) => getMasterRecord(moduleSlug, idOrObj),
    delete: async (idOrObj) => deleteMasterRecord(moduleSlug, idOrObj),
  };
}
