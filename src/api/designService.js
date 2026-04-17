import apiClient from './apiClient';

const designService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/Designs${query ? `?${query}` : ''}`);
  },
  getById: (id) => apiClient.get(`/Designs/${id}`),
  create: (data) => apiClient.post('/Designs', data),
  update: (id, data) => apiClient.put(`/Designs/${id}`, data),
  updatePreview: (id, formData) => apiClient.put(`/Designs/${id}/preview`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => apiClient.delete(`/Designs/${id}`),
};

export default designService;
