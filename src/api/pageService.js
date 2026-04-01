import apiClient from './apiClient';

const pageService = {
  getByDesignId: (designId) => apiClient.get(`/designs/${designId}/pages`),
  create: (designId, data) => apiClient.post(`/designs/${designId}/pages`, data),
  update: (pageId, data) => apiClient.put(`/pages/${pageId}`, data),
  reorder: (designId, pageOrders) => apiClient.put(`/designs/${designId}/pages/reorder`, { pageOrders }),
  updatePreview: (pageId, formData) => apiClient.put(`/pages/${pageId}/preview`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

export default pageService;
