import apiClient from './apiClient';

const templateService = {
  listTemplates: async (page = 1, pageSize = 10) => {
    return await apiClient.get(`/Templates?page=${page}&pageSize=${pageSize}`);
  },

  getTemplate: async (id) => {
    return await apiClient.get(`/Templates/${id}`);
  },

  createTemplate: async (formData) => {
    return await apiClient.post('/Templates', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateAutoSave: async (id, canvasJsonStr) => {
    return await apiClient.put(`/Templates/${id}/autosave`, canvasJsonStr, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  saveTemplate: async (id, formData) => {
    return await apiClient.put(`/Templates/${id}/save`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  discardChanges: async (id) => {
    return await apiClient.delete(`/Templates/${id}/discard`);
  },

  setVisibility: async (id, isPublic) => {
    return await apiClient.put(`/Templates/${id}/visibility?isPublic=${isPublic}`);
  },

  deleteTemplate: async (id) => {
    return await apiClient.delete(`/Templates/${id}`);
  },

  listTrash: async (page = 1, pageSize = 10) => {
    return await apiClient.get(`/Templates/trash?page=${page}&pageSize=${pageSize}`);
  },

  restoreTemplate: async (id) => {
    return await apiClient.put(`/Templates/${id}/restore`);
  },

  permanentDeleteTemplate: async (id) => {
    return await apiClient.delete(`/Templates/${id}/permanent`);
  },

  /**
   * Snapshot selected project pages into a new immutable template.
   * @param {FormData} formData - FormData containing ProjectId, Name, SelectedPageIds[], files[], etc.
   */
  createFromProject: async (formData) => {
    return await apiClient.post('/Templates/from-project', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Clone a template into a new project for the current user.
   * @param {string} id - Template ID to clone
   * @returns {{ success: boolean, data: { id: string } }}
   */
  useTemplate: async (id) => {
    return await apiClient.post(`/Templates/${id}/use`);
  }
};

export default templateService;
