import { apiClient } from './api-client';

export const getActivityLogs = async (userId, page = 1, limit = 20) => {
  return apiClient(`/activity-logs/${userId}?page=${page}&limit=${limit}`, { method: 'GET' });
};

export const getAllActivityLogs = async (filters = {}, page = 1, limit = 20) => {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    )
  }).toString();
  return apiClient(`/activity-logs/all?${queryParams}`, { method: 'GET' });
};
