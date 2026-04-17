import apiClient from './apiClient';

const canvasAssetService = {
  /**
   * Upload an image file to be used inside a Design canvas.
   * Returns { assetId, preSignedUrl, objectKey }.
   * @param {string} designId - UUID of the design
   * @param {File} file - Binary file object
   */
  uploadToDesign: async (designId, file) => {
    const formData = new FormData();
    formData.append('File', file);
    return apiClient.post(`/Designs/${designId}/assets`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Upload an image file to be used inside a Template canvas.
   * Returns { assetId, preSignedUrl, objectKey }.
   * @param {string} templateId - UUID of the template
   * @param {File} file - Binary file object
   */
  /**
   * Upload an image file to be used inside a Template canvas.
   * Returns { assetId, preSignedUrl, objectKey }.
   * @param {string} templateId - UUID of the template
   * @param {File} file - Binary file object
   */
  uploadToTemplate: async (templateId, file) => {
    const formData = new FormData();
    formData.append('File', file);
    return apiClient.post(`/Templates/${templateId}/assets`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Handshake: Check if an asset with the given SHA-256 hash already exists
   * within this design's scope. Returns { assetId, preSignedUrl, objectKey }
   * or null on 404 (meaning upload is required).
   * @param {string} designId - UUID of the design
   * @param {string} hash - SHA-256 hex string of the binary
   */
  checkAssetInDesign: async (designId, hash) => {
    try {
      return await apiClient.get(`/Designs/${designId}/assets/check/${hash}`);
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  /**
   * Handshake: Check if an asset with the given SHA-256 hash already exists
   * within this template's scope.
   * @param {string} templateId - UUID of the template
   * @param {string} hash - SHA-256 hex string of the binary
   */
  checkAssetInTemplate: async (templateId, hash) => {
    try {
      return await apiClient.get(`/Templates/${templateId}/assets/check/${hash}`);
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },
};

export default canvasAssetService;
