import { apiClient } from './client';

export const authApi = {
  async register({ name, email, password, role = 'student' }) {
    return apiClient('/auth/register', {
      method: 'POST',
      body: { name, email, password, role },
    });
  },

  async login({ email, password }) {
    return apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async getMe() {
    return apiClient('/auth/me', {
      method: 'GET',
    });
  },

  async checkHealth() {
    return apiClient('/health', {
      method: 'GET',
    });
  },
};

