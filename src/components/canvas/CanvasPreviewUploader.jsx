import { useEffect, useRef } from 'react';
import { useCanvasContext } from '../../context/CanvasContext';

const IMAGE_CACHE_NAME = 'design-previews';

const CanvasPreviewUploader = () => {
    const { canvases, previews, designInfo } = useCanvasContext();
    const previewsRef = useRef(previews);
    const canvasesRef = useRef(canvases);
    const designInfoRef = useRef(designInfo);

    // Keep refs in sync with latest state for the closing/unmount effect
    useEffect(() => {
        previewsRef.current = previews;
    }, [previews]);

    useEffect(() => {
        canvasesRef.current = canvases;
    }, [canvases]);

    useEffect(() => {
        designInfoRef.current = designInfo;
    }, [designInfo]);

    useEffect(() => {
        const uploadFinalPreview = async () => {
            const dataUrl = previewsRef.current?.[0];
            const pageId = canvasesRef.current?.[0]?._pageId;
            const oldPreviewUrl = designInfoRef.current?.previewImageUrl;

            if (!dataUrl || !pageId) {
                console.log('CanvasPreviewUploader: Missing dataUrl or pageId, skipping upload');
                return;
            }

            try {
                // 1. Convert DataURL to Blob/File (WebP format as requested by integration guide)
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'preview.webp', { type: 'image/webp' });

                const formData = new FormData();
                formData.append('File', file);

                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5209/api';
                const token = localStorage.getItem('token');
                
                // 2. Perform upload
                // Use native fetch with keepalive to ensure upload completes during tab closure
                await fetch(`${baseUrl}/pages/${pageId}/preview`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                    keepalive: true
                });
                
                // 3. Selective Invalidation: Delete the old image from browser's CacheStorage
                // This is the "Menghapus gambarnya di local" part based on URL signature
                if (oldPreviewUrl && 'caches' in window) {
                    try {
                        const cache = await caches.open(IMAGE_CACHE_NAME);
                        const deleted = await cache.delete(oldPreviewUrl);
                        console.log(`CanvasPreviewUploader: Cache invalidation for ${oldPreviewUrl}: ${deleted ? 'Success' : 'Not found/Failed'}`);
                    } catch (cacheErr) {
                        console.error('CanvasPreviewUploader: Failed to delete cache entry:', cacheErr);
                    }
                }

                console.log('CanvasPreviewUploader: Final preview processed successfully');
            } catch (err) {
                console.error('CanvasPreviewUploader: Failed to process preview upload:', err);
            }
        };

        const handleBeforeUnload = () => {
            uploadFinalPreview();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            uploadFinalPreview(); // Trigger on navigate away (unmount)
        };
    }, []);

    return null;
};

export default CanvasPreviewUploader;
