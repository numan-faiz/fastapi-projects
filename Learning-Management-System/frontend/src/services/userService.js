import api from './api';

export const userService = {
  getTeachers: async () => {
    const response = await api.get('/teacher/');
    return response.data;
  },

  createTeacher: async (data) => {
    const response = await api.post('/teacher/', data);
    return response.data;
  },

  updateTeacher: async (id, data) => {
    const response = await api.put(`/teacher/${id}`, data);
    return response.data;
  },

  deleteTeacher: async (id) => {
    const response = await api.delete(`/teacher/${id}`);
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get('/student/');
    return response.data;
  },

  createStudent: async (data) => {
    const response = await api.post('/student/', data);
    return response.data;
  },

  updateStudent: async (id, data) => {
    const response = await api.put(`/student/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await api.delete(`/student/${id}`);
    return response.data;
  },
};
