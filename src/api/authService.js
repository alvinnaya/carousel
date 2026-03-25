import apiClient from './apiClient';

const authService = {
  register: (data) => apiClient.post('/Auth/register', data),
  login: (data) => apiClient.post('/Auth/login', data),
  confirmEmail: (userId, token) => 
    apiClient.get(`/Auth/confirm-email?userId=${userId}&token=${token}`),
  refreshToken: (refreshToken) => apiClient.post('/Auth/refresh-token', { refreshToken }),
  logout: (refreshToken) => apiClient.post('/Auth/logout', { refreshToken }),
};

export default authService;
