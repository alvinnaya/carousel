import apiClient from './apiClient';

const pageService = {
  getByDesignId: (designId) => apiClient.get(`/designs/${designId}/pages`),
  create: (designId, data) => apiClient.post(`/designs/${designId}/pages`, data),
  update: (pageId, data) => apiClient.put(`/pages/${pageId}`, data),
  delete: (pageId) => apiClient.delete(`/pages/${pageId}`),
};

export default pageService;
