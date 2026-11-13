import { apiClient } from './client';

export const doubtsApi = {
  async getDoubts({ classroomId, status, page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams();
    if (classroomId) params.append('classroomId', classroomId);
    if (status) params.append('status', status);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`/doubts${query}`, {
      method: 'GET',
    });
  },

  async getDoubtById(id) {
    return apiClient(`/doubts/${id}`, {
      method: 'GET',
    });
  },

  async createDoubt({ classroomId, subject, topic, text }) {
    return apiClient('/doubts', {
      method: 'POST',
      body: { classroomId, subject, topic, text },
    });
  },

  async retryDoubt(id) {
    return apiClient(`/doubts/${id}/retry`, {
      method: 'POST',
    });
  },
};

