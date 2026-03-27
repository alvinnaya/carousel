import imageService from '../api/imageService';

/**
 * Mendeteksi apakah URL adalah signed URL R2 yang sudah expired atau akan expired.
 */
export const isSignedUrlExpired = (url) => {
    if (!url || !url.includes('X-Amz-Date')) return false; 
    try {
        const urlObj = new URL(url);
        const dateStr = urlObj.searchParams.get('X-Amz-Date');
        const expiresStr = urlObj.searchParams.get('X-Amz-Expires');
        if (!dateStr || !expiresStr) return true;

        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const min = dateStr.substring(11, 13);
        const sec = dateStr.substring(13, 15);
        
        const createdDate = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
        const expiresMs = parseInt(expiresStr) * 1000;
        const now = new Date();

        return now.getTime() > (createdDate.getTime() + expiresMs - 300000);
    } catch (e) {
        return true;
    }
};

/**
 * Mengekstrak object key dari URL R2 (signed atau public jika ada).
 */
export const extractObjectKey = (url) => {
    if (!url || typeof url !== 'string') return null;
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        if (path.startsWith('/')) return path.substring(1);
        return path;
    } catch (e) {
        return null;
    }
};

/**
 * Memperbarui URL gambar dalam JSON kanvas jika sudah expired.
 * Berguna untuk migrasi desain lama ke URL yang stabil.
 */
export const refreshCanvasImageUrls = async (canvasJson) => {
    if (!canvasJson || !canvasJson.objects) return canvasJson;

    const expiredImages = canvasJson.objects.filter(obj => 
        (obj.type === 'image' || obj.type === 'FabricImage') && isSignedUrlExpired(obj.src)
    );
    
    if (expiredImages.length === 0) return canvasJson;

    try {
        // Fetch all available images from both user and admin pools if needed
        const userImagesRes = await imageService.getMyImages();
        const availableImages = userImagesRes?.success ? userImagesRes.data : (Array.isArray(userImagesRes) ? userImagesRes : []);
        const urlMap = new Map();
        availableImages.forEach(img => { if (img.objectKey) urlMap.set(img.objectKey, img.url); });

        const updatedObjects = canvasJson.objects.map(obj => {
            if ((obj.type === 'image' || obj.type === 'FabricImage') && isSignedUrlExpired(obj.src)) {
                const key = obj.imageKey || extractObjectKey(obj.src);
                if (key && urlMap.has(key)) {
                    return { 
                        ...obj, 
                        src: urlMap.get(key), 
                        imageKey: key, 
                        crossOrigin: 'anonymous' 
                    };
                }
            }
            return obj;
        });
        return { ...canvasJson, objects: updatedObjects };
    } catch (err) {
        console.warn('Failed to refresh expired signed URLs', err);
        return canvasJson;
    }
};

/**
 * Memperbarui URL gambar dalam array halaman desain.
 */
export const refreshPagesImageUrls = async (pages) => {
    if (!Array.isArray(pages)) return pages;
    return await Promise.all(pages.map(async (page) => {
        if (!page.canvasJson) return page;
        try {
            const parsed = JSON.parse(page.canvasJson);
            const refreshed = await refreshCanvasImageUrls(parsed);
            return { 
                ...page, 
                canvasJson: JSON.stringify(refreshed) 
            };
        } catch (e) { 
            return page; 
        }
    }));
};

/**
 * Memastikan semua objek gambar memiliki CORS 'anonymous' untuk menghindari Tainted Canvas.
 */
export const ensureCORS = (canvasJson) => {
    if (!canvasJson || !canvasJson.objects) return canvasJson;
    const updatedObjects = canvasJson.objects.map(obj => {
        if (obj.type === 'image' || obj.type === 'FabricImage') {
            return { ...obj, crossOrigin: 'anonymous' };
        }
        return obj;
    });
    return { ...canvasJson, objects: updatedObjects };
};
