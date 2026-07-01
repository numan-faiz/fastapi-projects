import api from './api';

export const attendanceService = {
  markAttendance: async (data) => {
    const response = await api.post('/attendance/', data);
    return response.data;
  },

  getAttendanceReport: async (params) => {
    const response = await api.get('/attendance/report', { params });
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get('/attendance/my');
    return response.data;
  },
};
