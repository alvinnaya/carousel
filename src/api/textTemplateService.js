import apiClient from './apiClient';

const textTemplateService = {
  /**
   * List design elements with optional filters.
   * @param {number} page
   * @param {number} pageSize
   * @param {string} category - 'Text', 'Shape', or 'Group'
   * @param {string} type - 'JSON' or 'SVG'
   */
  listTextTemplates: async (page = 1, pageSize = 50, category = '', type = '') => {
    let url = `/TextTemplates?page=${page}&pageSize=${pageSize}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    return await apiClient.get(url);
  },

  getTextTemplate: async (id) => {
    return await apiClient.get(`/TextTemplates/${id}`);
  },

  /**
   * Create a new design element.
   * FormData must include: name, category, type, previewImage.
   * If type=JSON: include canvasJson.
   * If type=SVG: include assetFile.
   */
  createTextTemplate: async (formData) => {
    return await apiClient.post('/TextTemplates', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
  },

  updateMetadata: async (id, data) => {
    return await apiClient.put(`/TextTemplates/${id}/metadata`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  deleteTextTemplate: async (id) => {
    return await apiClient.delete(`/TextTemplates/${id}`);
  }
};

export default textTemplateService;
