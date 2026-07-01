import api from './api';

export const activityLogService = {
  getActivityLogs: async (limit = 10) => {
    const response = await api.get(`/activity-log/?limit=${limit}`);
    return response.data;
  },
};
