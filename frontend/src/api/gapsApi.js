import { apiClient } from './client';

export const gapsApi = {
  async getClassroomGaps(classroomId) {
    return apiClient(`/classrooms/${classroomId}/gaps`, {
      method: 'GET',
    });
  },

  async getStudentGaps(studentId) {
    return apiClient(`/students/${studentId}/gaps`, {
      method: 'GET',
    });
  },
};

