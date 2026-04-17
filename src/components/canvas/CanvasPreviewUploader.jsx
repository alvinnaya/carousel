import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const IMAGE_CACHE_NAME = 'design-previews';

/**
 * Sync helper to convert dataURI to Blob
 * Critical for beforeunload/visibilitychange because browser might kill async fetch(dataUrl)
 */
const dataURLToBlob = (dataURL) => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const CanvasPreviewUploader = () => {
  const { previews, designInfo, triggerPreviewUpload } = useCanvasContext();
  const previewsRef = useRef(previews);
  const designInfoRef = useRef(designInfo);

  /**
   * Uploads the first page thumbnail as the design cover.
   * @param {boolean} isClosing - If true, uses keepalive:true (subject to 64KB browser limit)
   */
  const uploadFinalPreview = async (isClosing = false) => {
    // If called via Event Listener, isClosing might be an event object
    const closing = isClosing === true || (isClosing && isClosing.type === 'beforeunload');
    
    const dataUrl = previewsRef.current?.[0];
    const designId = designInfoRef.current?.id;
    const oldPreviewUrl = designInfoRef.current?.previewImageUrl;

    if (!dataUrl || !designId) return;

    try {
      const blob = dataURLToBlob(dataUrl);
      const file = new File([blob], 'preview.webp', { type: 'image/webp' });

      const formData = new FormData();
      formData.append('File', file);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5209/api';
      const token = localStorage.getItem('token');

      console.log(`CanvasPreviewUploader: Uploading preview for ${designId} (isClosing: ${closing})`);
      
      await fetch(`${baseUrl}/Designs/${designId}/preview`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        // Only use keepalive when tab is closing to avoid 64KB limit for manual navigations
        keepalive: closing
      });

      if (oldPreviewUrl && 'caches' in window) {
        try {
          const cache = await caches.open(IMAGE_CACHE_NAME);
          await cache.delete(oldPreviewUrl);
        } catch (e) {}
      }
    } catch (err) {
      console.error('CanvasPreviewUploader: Failed to process preview upload:', err);
    }
  };

  useEffect(() => {
    // Expose the upload function to the context ref
    triggerPreviewUpload.current = () => uploadFinalPreview(false);
  }, []);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    designInfoRef.current = designInfo;
  }, [designInfo]);

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      uploadFinalPreview(true);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
        uploadFinalPreview(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};

export default CanvasPreviewUploader;
