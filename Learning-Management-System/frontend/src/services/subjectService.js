import api from './api';

export const subjectService = {
  getSubjects: async () => {
    const response = await api.get('/subject/');
    return response.data;
  },

  createSubject: async (data) => {
    const response = await api.post('/subject/', data);
    return response.data;
  },

  updateSubject: async (id, data) => {
    const response = await api.put(`/subject/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id) => {
    const response = await api.delete(`/subject/${id}`);
    return response.data;
  },

  assignTeacher: async (subjectId, teacherId) => {
    const response = await api.post(`/subject/${subjectId}/teacher/${teacherId}`);
    return response.data;
  },

  assignStudent: async (subjectId, studentId) => {
    const response = await api.post(`/subject/${subjectId}/student/${studentId}`);
    return response.data;
  },

  removeTeacher: async (subjectId, teacherId) => {
    const response = await api.delete(`/subject/${subjectId}/teacher/${teacherId}`);
    return response.data;
  },

  removeStudent: async (subjectId, studentId) => {
    const response = await api.delete(`/subject/${subjectId}/student/${studentId}`);
    return response.data;
  },

  getMySubjects: async () => {
    const response = await api.get('/subject/my-subjects');
    return response.data;
  },
};
