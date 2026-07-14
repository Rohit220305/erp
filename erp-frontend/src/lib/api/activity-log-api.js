import { apiClient } from './api-client';

export const getActivityLogs = async (userId, page = 1, limit = 20, startDate = null, endDate = null) => {
  return apiClient('/activity-logs/get-logs', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      page,
      limit,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });
};

export const getAllActivityLogs = async (data = { page: 1, limit: 20 }) => {
  return apiClient('/activity-logs/list-activity-log', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getActivityLogDetails = async (id) => {
  return apiClient(`/activity-logs/get-activity-log?id=${id}`, {
    method: 'GET',
  });
};
