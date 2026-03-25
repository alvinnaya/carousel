import apiClient from './apiClient';

const userService = {
  getAll: () => apiClient.get('/Users'),
  getStats: (id) => apiClient.get(`/Users/${id}/stats`),
  promoteToAdmin: (id) => apiClient.post(`/Users/${id}/promote`),
};

export default userService;
