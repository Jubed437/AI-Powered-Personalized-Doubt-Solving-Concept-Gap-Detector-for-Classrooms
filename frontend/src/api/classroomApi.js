import { apiClient } from './client';

export const classroomApi = {
  async getClassrooms() {
    return apiClient('/classrooms', {
      method: 'GET',
    });
  },

  async getClassroomById(id) {
    return apiClient(`/classrooms/${id}`, {
      method: 'GET',
    });
  },

  async createClassroom({ name, subject }) {
    return apiClient('/classrooms', {
      method: 'POST',
      body: { name, subject },
    });
  },

  async joinClassroom(joinCode) {
    return apiClient('/classrooms/join', {
      method: 'POST',
      body: { joinCode: joinCode.trim().toUpperCase() },
    });
  },
};

