import apiClient from './apiClient';

const imageService = {
  // Get My Images (Private)
  getMyImages: async (ts) => {
    return apiClient.get(`/Images${ts ? `?ts=${ts}` : ''}`);
  },

  // Get Public Assets (Stock Images)
  getPublicAssets: async (ts) => {
    return apiClient.get(`/Images/public-assets${ts ? `?ts=${ts}` : ''}`);
  },

  // Get All Private Images (Admin Only)
  getAdminPrivateImages: async (ts) => {
    return apiClient.get(`/Images/admin/private-assets${ts ? `?ts=${ts}` : ''}`);
  },

  // Upload Image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('File', file); // Case Sensitive for ASP.NET
    return apiClient.post('/Images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update Image Name
  updateImageName: async (key, newName) => {
    return apiClient.put('/Images/name', { key, newName });
  },

  // Set Public
  makeImagePublic: async (key) => {
    return apiClient.put(`/Images/make-public?key=${key}`);
  },

  // Set Private
  makeImagePrivate: async (key) => {
    return apiClient.put(`/Images/make-private?key=${key}`);
  },

  // Delete Image
  deleteImage: async (key) => {
    return apiClient.delete(`/Images?key=${key}`);
  },

  /**
   * @deprecated Use the list endpoints instead, they now return batch pre-signed URLs.
   */
  getImageUrl: async (objectKey) => {
    return apiClient.get(`/Images/url?key=${encodeURIComponent(objectKey)}`);
  },

  // Legacy alias for getMyImages
  getAllImages: async () => {
    return apiClient.get('/Images');
  },

  // NEW: Get stable URL for design assets (NOT global promotion)
  getStableUrl: async (objectKey) => {
    return apiClient.post(`/Images/stable-url?key=${encodeURIComponent(objectKey)}`);
  }
};

export default imageService;

